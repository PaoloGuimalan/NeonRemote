/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Conversations in the playground.
 *
 * "New chat" used to be a button that did nothing - there was no way to start
 * a conversation from the UI at all, so the only usable thread was whichever
 * one already existed in the database.
 */
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useApiContext } from "@/app/context/OrganizationContext";
import { FormDialog } from "@/app/widgets/Modal";
import {
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Grid,
  Loading,
  Page,
  PageHeader,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversations } from "@/hooks/api/resources";
import { AuthStateInterface, IConversation, IPagination } from "@/hooks/interfaces";
import { GetMessagesListRequest } from "@/hooks/requests";
import { formatToWords } from "@/hooks/reusables";
import { paginationstate } from "@/hooks/states";

function ChatsList() {
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const ctx = useApiContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Carried through from the Agents screen's "Try it" button, so the
  // conversation opens with that agent selected rather than dropping the
  // intent at this screen and defaulting to whichever agent is first.
  const preselectedAgent = searchParams.get("agent");
  const open = (conversationId: string) =>
    navigate(
      `/playground/${conversationId}` +
        (preselectedAgent ? `?agent=${preselectedAgent}` : ""),
    );

  const [conversations, setconversations] = useState<IPagination<IConversation>>(paginationstate);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");

  const [creating, setcreating] = useState(false);
  const [name, setname] = useState("");
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");

  const load = () => {
    if (!authentication.user.token) return;
    setloading(true);
    seterror("");
    GetMessagesListRequest({ token: authentication.user.token })
      .then(setconversations)
      // Was swallowed into a console.log, so a failed load looked exactly like
      // having no conversations.
      .catch((err) => seterror(err?.message ?? "Could not load conversations."))
      .finally(() => setloading(false));
  };

  useEffect(load, [authentication.user.token, ctx.organizationId]);

  const create = async () => {
    setbusy(true);
    setformError("");
    try {
      const created = await Conversations.create(ctx, { name: name.trim() || "New conversation" });
      setcreating(false);
      setname("");
      open(created.conversation_id);
    } catch (err: any) {
      setformError(err?.message ?? "Could not start that conversation.");
    } finally {
      setbusy(false);
    }
  };

  const openCreate = () => {
    setname("");
    setformError("");
    setcreating(true);
  };

  return (
    <Page>
      <PageHeader
        title="Playground"
        description="Try an agent in a real conversation before you publish it."
        action={
          <Button
            onClick={openCreate}
            className="gap-[5px] text-[12px] h-[35px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "15px" }} />
            <span>New conversation</span>
          </Button>
        }
      />

      <ErrorNotice message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading conversations" />
      ) : conversations.results.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start one to try an agent out."
          action={
            <Button
              onClick={openCreate}
              className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black"
            >
              New conversation
            </Button>
          }
        />
      ) : (
        <Grid>
          {conversations.results.map((conversation) => (
            <Card
              key={conversation.conversation_id}
              className="h-[160px]"
              onClick={() => open(conversation.conversation_id)}
            >
              <span className="text-[14px] font-semibold line-clamp-1">{conversation.name}</span>
              <span className="text-[13px] text-[#525252] leading-[1.4] line-clamp-3 flex flex-1">
                {conversation.latest_message?.content?.replace(/<[^>]*>/g, "") ??
                  "No messages yet."}
              </span>
              <div className="w-full flex flex-row items-center gap-[10px] text-[12px] text-[#767676]">
                <span className="flex flex-1">{formatToWords(conversation.created_at)}</span>
                {conversation.latest_message?.created_at && (
                  <span>{formatToWords(conversation.latest_message.created_at)}</span>
                )}
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <FormDialog
        open={creating}
        onOpenChange={setcreating}
        title="New conversation"
        error={formError}
        submitLabel="Start"
        submitting={busy}
        onSubmit={create}
      >
        <Field label="Name" hint="Just for your own reference.">
          <Input
            value={name}
            autoFocus
            placeholder="Testing the support agent"
            onChange={(e) => setname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
            }}
          />
        </Field>
      </FormDialog>
    </Page>
  );
}

export default ChatsList;
