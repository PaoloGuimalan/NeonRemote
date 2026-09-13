/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The playground: one conversation, streamed.
 *
 * THE HARDCODED UUIDS ARE GONE
 * ----------------------------
 * This used to post two literal uuids as `agent_uuid` and `model_uuid`,
 * pointing at rows in one particular database. On any other deployment - or
 * after either row was deleted - every message failed, and the reason was
 * invisible because the ids were buried in the request body. They are now
 * chosen from the organization's own agents and models.
 *
 * The choice is remembered per conversation, so returning to a thread does not
 * silently continue it with a different agent than it started with.
 */
import { useEffect, useMemo, useState } from "react";
import { MdSend } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import LoaderWithTooltip from "@/app/widgets/Messages/LoaderWithTooltip";
import { ErrorNotice, Notice, Select } from "@/app/widgets/Shell";
import { TextareaAutosize } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { Agents as AgentsApi, Catalogue } from "@/hooks/api/resources";
import { IAgent, IModel } from "@/hooks/api/types";
import {
  AuthStateInterface,
  IConversation,
  IMessage,
  IPagination,
  IPendingMessage,
} from "@/hooks/interfaces";
import {
  GetConversationInfoRequest,
  GetMessagesRequest,
  StreamMessageRequest,
} from "@/hooks/requests";
import { defaultConversationState, paginationstate } from "@/hooks/states";
import { useResource } from "@/hooks/useResource";

const choiceKey = (conversationID: string) => `neon.playground.${conversationID}`;

function Conversation() {
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const { conversationID } = useParams();
  const [searchParams] = useSearchParams();

  const agents = useResource<IAgent[]>((ctx) => AgentsApi.list(ctx), []);
  const models = useResource<IModel[]>((ctx) => Catalogue.models(ctx), []);

  const [conversation, setconversation] = useState<IConversation>(defaultConversationState);
  const [message, setmessage] = useState<string>("");
  const [messages, setmessages] = useState<IPagination<IMessage>>(paginationstate);
  const [pendingMessages, setpendingMessages] = useState<IPendingMessage[]>([]);
  const [isAITyping, setisAITyping] = useState<boolean>(false);
  const [currentToken, setcurrentToken] = useState<string>("Thinking...");
  const [error, seterror] = useState("");

  const [agentUuid, setagentUuid] = useState("");
  const [modelUuid, setmodelUuid] = useState("");

  const activeAgents = useMemo(() => agents.data.filter((agent) => agent.is_active), [agents.data]);

  // Restore the pair this conversation was started with, falling back to an
  // agent named in the URL (the "Try it" button on the Agents screen) and then
  // to the first usable option.
  useEffect(() => {
    if (!conversationID || agents.loading || models.loading) return;

    let storedAgent = "";
    let storedModel = "";
    try {
      const raw = localStorage.getItem(choiceKey(conversationID));
      if (raw) {
        const parsed = JSON.parse(raw);
        storedAgent = parsed.agent ?? "";
        storedModel = parsed.model ?? "";
      }
    } catch {
      // A corrupt entry is not worth failing over; the defaults below apply.
    }

    const requested = searchParams.get("agent") ?? "";
    const agentExists = (value: string) => activeAgents.some((agent) => agent.uuid === value);
    const modelExists = (value: string) => models.data.some((model) => model.uuid === value);

    setagentUuid(
      [requested, storedAgent].find(agentExists) ?? activeAgents[0]?.uuid ?? "",
    );
    setmodelUuid(modelExists(storedModel) ? storedModel : (models.data[0]?.uuid ?? ""));
  }, [conversationID, agents.loading, models.loading, activeAgents.length, models.data.length]);

  useEffect(() => {
    if (!conversationID || !agentUuid || !modelUuid) return;
    localStorage.setItem(
      choiceKey(conversationID),
      JSON.stringify({ agent: agentUuid, model: modelUuid }),
    );
  }, [conversationID, agentUuid, modelUuid]);

  const GetMessagesProcess = () => {
    GetMessagesRequest({
      token: authentication.user.token,
      conversation_id: conversationID,
    })
      .then((response) => {
        const seen = response.results.map((mp: IMessage) => mp.pending_id).flat();

        setmessages(response);
        setisAITyping(false);
        setpendingMessages((prev) => prev.filter((flt) => !seen.includes(flt.pending_id)));

        const latestMessageId = response.results.length
          ? response.results.sort(
              (a: IMessage, b: IMessage) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )[0]?.message_id
          : null;

        setTimeout(() => {
          document.getElementById(latestMessageId)?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      })
      .catch((err) => {
        // Surfaced rather than console.logged: a conversation that silently
        // shows nothing is indistinguishable from an empty one.
        seterror(err?.message ?? "Could not load messages.");
        setisAITyping(false);
      });
  };

  const SendMessageProcess = async () => {
    const messageToSend = message;
    if (messageToSend.trim() === "" || !agentUuid || !modelUuid) return;

    seterror("");
    setmessage("");
    const pending_id = uuid();
    setpendingMessages((prev) => [
      { pending_id, message_type: "text", content: messageToSend },
      ...prev,
    ]);
    setTimeout(() => {
      document.getElementById(pending_id)?.scrollIntoView({ behavior: "smooth" });
      setisAITyping(true);
      setTimeout(() => {
        document.getElementById("loader")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }, 500);

    try {
      await StreamMessageRequest(
        { token: authentication.user.token, conversation_id: conversationID },
        {
          message_type: "text",
          content: messageToSend,
          agent_uuid: agentUuid,
          model_uuid: modelUuid,
          pending_id,
        },
        {
          onChunk: (chunk) => {
            chunk.split("data:").map((mp) => {
              if (mp.trim() !== "") {
                try {
                  const parsed = JSON.parse(mp);
                  setcurrentToken((prev) => (prev.length > 60 ? parsed.token : prev + parsed.token));
                } catch {
                  // A frame split across two reads arrives as half a JSON
                  // object. Dropping it loses one token of the progress
                  // preview; throwing would kill the whole stream.
                }
              }
            });
          },
          onDone: () => {
            setcurrentToken("Thinking...");
            GetMessagesProcess();
          },
        },
      );
    } catch (err: any) {
      setisAITyping(false);
      setcurrentToken("Thinking...");
      setpendingMessages((prev) => prev.filter((flt) => flt.pending_id !== pending_id));
      seterror(err?.message ?? "The reply could not be streamed.");
    }
  };

  useEffect(() => {
    if (authentication.user.token && conversationID) {
      GetMessagesProcess();
      GetConversationInfoRequest({
        token: authentication.user.token,
        conversation_id: conversationID,
      })
        .then(setconversation)
        .catch((err) => seterror(err?.message ?? "Could not load this conversation."));
    }
  }, [authentication, conversationID]);

  const notReady = !agents.loading && (activeAgents.length === 0 || models.data.length === 0);

  return (
    <div className="w-full flex flex-1 flex-col p-[20px] gap-[10px] items-center overflow-y-hidden font-Inter">
      <div className="w-full flex flex-row gap-[10px] items-center max-w-[1000px] flex-wrap">
        <span className="text-[20px] font-semibold flex flex-1 min-w-[160px] truncate">
          {conversation.name || "Playground"}
        </span>

        <Select
          value={agentUuid}
          onChange={setagentUuid}
          disabled={activeAgents.length === 0}
          className="max-w-[200px]"
        >
          {activeAgents.length === 0 ? (
            <option value="">No active agents</option>
          ) : (
            activeAgents.map((agent) => (
              <option key={agent.uuid} value={agent.uuid}>
                {agent.name}
              </option>
            ))
          )}
        </Select>

        <Select
          value={modelUuid}
          onChange={setmodelUuid}
          disabled={models.data.length === 0}
          className="max-w-[220px]"
        >
          {models.data.length === 0 ? (
            <option value="">No models</option>
          ) : (
            models.data.map((model) => (
              <option key={model.uuid} value={model.uuid}>
                {model.service_name} · {model.model}
              </option>
            ))
          )}
        </Select>
      </div>

      <div className="w-full max-w-[1000px] flex flex-col gap-[8px]">
        <ErrorNotice message={error} />
        {notReady && (
          <Notice>
            <span>
              {activeAgents.length === 0
                ? "There are no active agents yet. Create one on the Agents screen before sending a message."
                : "No models are available. Ask an administrator to add one to the catalogue."}
            </span>
          </Notice>
        )}
      </div>

      <div className="w-full flex flex-col flex-1 max-h-[calc(100%-140px)] bg-transparent overflow-y-scroll x-scroll px-[0px] items-center gap-[20px]">
        <div className="w-[calc(100%-10px)] max-w-[1000px] flex-1 flex flex-col-reverse px-[5px] gap-[10px]">
          {isAITyping && (
            <div className="w-full flex justify-start">
              <LoaderWithTooltip data={currentToken} />
              <section id="loader" />
            </div>
          )}
          {pendingMessages.map((mp) => (
            <div
              key={mp.pending_id}
              className={`w-full flex ${mp.message_type === "text" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="bg-[#f0f0f0] max-w-[70%] w-fit p-[10px] rounded-lg text-[14px] text-left opacity-70"
                dangerouslySetInnerHTML={{ __html: mp.content }}
              />
              <section id={mp.pending_id} />
            </div>
          ))}
          {messages.results.map((mp) => (
            <div
              key={mp.message_id}
              className={`w-full flex ${mp.message_type === "text" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] w-fit p-[10px] rounded-lg text-[14px] text-left ${
                  mp.message_type === "text" ? "bg-[#f0f0f0]" : "bg-[#eef2fb]"
                }`}
                dangerouslySetInnerHTML={{ __html: mp.content }}
              />
              <section id={mp.message_id} />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-row sticky top-0 justify-center">
        <div className="w-full flex flex-col p-[10px] bg-[#f0f0f0] rounded-xl max-w-[1000px]">
          <TextareaAutosize
            placeholder={notReady ? "Create an agent first" : "Ask me something"}
            className="bg-transparent border-none focus:outline-none focus-visible:outline-none border-transparent focus:border-transparent focus:ring-0 outline-none"
            value={message}
            onChange={(e) => setmessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                SendMessageProcess();
              }
            }}
          />
          <div className="w-full flex justify-end px-[10px]">
            <Button
              disabled={message.trim() === "" || notReady || !agentUuid || !modelUuid}
              onClick={SendMessageProcess}
              variant="outline"
              className="p-0 w-10 rounded-full"
            >
              <MdSend size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Conversation;
