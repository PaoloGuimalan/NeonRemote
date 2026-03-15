/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import LoaderWithTooltip from "@/app/widgets/Messages/LoaderWithTooltip";
import { TextareaAutosize } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { MdSend } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

function Conversation() {
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication,
  );

  const { conversationID } = useParams();

  const [conversation, setconversation] = useState<IConversation>(
    defaultConversationState,
  );
  const [message, setmessage] = useState<string>("");
  const [messages, setmessages] =
    useState<IPagination<IMessage>>(paginationstate);
  const [pendingMessages, setpendingMessages] = useState<IPendingMessage[]>([]);
  const [isAITyping, setisAITyping] = useState<boolean>(false);
  const [currentToken, setcurrentToken] = useState<string>("Thinking...");

  const GetMessagesProcess = () => {
    GetMessagesRequest({
      token: authentication.user.token,
      conversation_id: conversationID,
    })
      .then((response) => {
        const messages = response.results
          .map((mp: IMessage) => mp.pending_id)
          .flat();

        setmessages(response);
        setisAITyping(false);
        setpendingMessages((prev: IPendingMessage[]) => {
          const newprev = prev.filter(
            (flt: IPendingMessage) => !messages.includes(flt.pending_id),
          );

          return newprev;
        });

        const latestMessageId = response.results.length
          ? response.results.sort(
              (a: IMessage, b: IMessage) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )[0]?.message_id
          : null;

        setTimeout(() => {
          document
            .getElementById(latestMessageId)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const SendMessageProcess = async () => {
    const messageToSend = message;
    setmessage("");
    const pending_id = uuid();
    setpendingMessages((prev) => [
      {
        pending_id: pending_id,
        message_type: "text",
        content: messageToSend,
      },
      ...prev,
    ]);
    setTimeout(() => {
      document
        .getElementById(pending_id)
        ?.scrollIntoView({ behavior: "smooth" });
      setisAITyping(true);
      setTimeout(() => {
        document
          .getElementById("loader")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }, 500);
    await StreamMessageRequest(
      {
        token: authentication.user.token,
        conversation_id: conversationID,
      },
      {
        message_type: "text",
        content: messageToSend,
        agent_uuid: "f2bb1740-f408-45d4-b4b3-3a7b03bb268e",
        model_uuid: "1b54fee3-c7e7-4535-926a-a83f7f2cab8c",
        pending_id,
      },
      {
        onChunk: (chunk) => {
          chunk.split("data:").map((mp) => {
            if (mp.trim() !== "") {
              const parsed = JSON.parse(mp);
              setcurrentToken((prev) => {
                if (prev.length > 60) {
                  return parsed.token;
                }

                return prev + parsed.token;
              });
            }
          });
        },
        onDone: () => {
          setcurrentToken("Thinking...");
          GetMessagesProcess();
        },
      },
    );
  };

  useEffect(() => {
    if (authentication.user.token && conversationID) {
      GetMessagesProcess();
      GetConversationInfoRequest({
        token: authentication.user.token,
        conversation_id: conversationID,
      })
        .then((response) => {
          setconversation(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [authentication, conversationID]);

  return (
    <div className="w-full flex flex-1 flex-col p-[20px] gap-[10px] items-center overflow-y-hidden">
      <div className="w-full flex flex-row top-0 h-[30px] max-w-[1000px]">
        <div className="flex flex-row gap-[20px] items-center">
          <span className="text-[20px] font-semibold">{conversation.name}</span>
        </div>
      </div>
      <div className="w-full flex flex-col flex-1 max-h-[calc(100%-90px)] bg-transparent overflow-y-scroll x-scroll px-[0px] items-center font-Inter gap-[20px]">
        <div className="w-[calc(100%-10px)] max-w-[calc(1000px-0px)] flex-1 flex flex-col-reverse px-[5px] gap-[10px]">
          {isAITyping && (
            <div className={`w-full flex "justify-start"`}>
              <LoaderWithTooltip data={currentToken} />
              <section id="loader" />
            </div>
          )}
          {pendingMessages.map((mp: IPendingMessage) => {
            return (
              <div
                key={mp.pending_id}
                className={`w-full flex ${mp.message_type === "text" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="bg-[#f0f0f0] max-w-[50%] w-fit p-[10px] rounded-lg text-[14px] text-left"
                  dangerouslySetInnerHTML={{
                    __html: mp.content,
                  }}
                />
                <section id={mp.pending_id} />
              </div>
            );
          })}
          {messages.results.length > 0 &&
            messages.results.map((mp: IMessage) => {
              return (
                <div
                  key={mp.message_id}
                  className={`w-full flex ${mp.message_type === "text" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="bg-[#f0f0f0] max-w-[50%] w-fit p-[10px] rounded-lg text-[14px] text-left"
                    dangerouslySetInnerHTML={{
                      __html: mp.content,
                    }}
                  />
                  <section id={mp.message_id} />
                </div>
              );
            })}
        </div>
      </div>
      <div className="w-full flex flex-row sticky top-0 justify-center z-[10000]">
        <div className="w-full flex flex-col p-[10px] bg-[#f0f0f0] rounded-xl max-w-[1000px]">
          <TextareaAutosize
            placeholder="Ask me something"
            className="bg-transparent  border-none focus:outline-none focus-visible:outline-none border-transparent focus:border-transparent focus:ring-0 outline-none"
            value={message}
            onChange={(e) => setmessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                SendMessageProcess();
              }
            }}
          />
          <div className="w-full flex justify-between px-[10px]">
            <div className="flex gap-[5px]">
              <Button variant="outline" className="p-0 w-10 rounded-full">
                <IoAdd size={20} />
              </Button>
            </div>
            <div className="flex gap-[5px]">
              <Button
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
    </div>
  );
}

export default Conversation;
