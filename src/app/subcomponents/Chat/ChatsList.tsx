/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Conversations in the playground.
 *
 * "New chat" used to be a button that did nothing - there was no way to start
 * a conversation from the UI at all, so the only usable thread was whichever
 * one already existed in the database.
 *
 * WHY THE ORIGIN FILTER AND THE BADGES ARE HERE
 * ---------------------------------------------
 * This list is `created_by = me`, and a Chatterloop bot's conversations are
 * attributed to whoever owns the bot - so a bot answering mentions all day
 * fills its owner's playground with threads they never started and cannot
 * reply to. They are still worth being able to reach, which is why the answer
 * is a label and a filter rather than hiding them.
 */
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useApiContext } from "@/app/context/OrganizationContext";
import { FormDialog } from "@/app/widgets/Modal";
import {
  Badge,
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
import {
  AuthStateInterface,
  ConversationOrigin,
  IConversation,
  IPagination,
} from "@/hooks/interfaces";
import { GetMessagesListRequest } from "@/hooks/requests";
import { formatToWords } from "@/hooks/reusables";
import { paginationstate } from "@/hooks/states";

/**
 * The tabs across the top of the list.
 *
 * `origins: []` means "send no filter", which is how "All" stays a single
 * request with no parameter rather than one naming every value - the two are
 * equivalent today and would stop being so the moment a fourth surface is
 * added on the platform.
 */
const FILTERS: { key: string; label: string; origins: ConversationOrigin[] }[] = [
  { key: "all", label: "All", origins: [] },
  { key: "native", label: "Mine", origins: ["native"] },
  { key: "integrations", label: "Integrations", origins: ["external", "chatterloop"] },
];

/**
 * One line of a message, for the card.
 *
 * The card is three lines of plain text, so the Markdown is stripped rather
 * than rendered - a heading or a code fence in a preview reads as debris. The
 * old version stripped HTML tags, which was aimed at the same problem from
 * when message bodies were being treated as HTML.
 */
function preview(content?: string) {
  if (!content?.trim()) return "No messages yet.";
  return content
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/(\*\*|__|~~|\*)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Badge tone per surface. Neutral for our own, so only the others stand out. */
const ORIGIN_TONE: Record<ConversationOrigin, "neutral" | "good" | "warn"> = {
  native: "neutral",
  external: "good",
  chatterloop: "warn",
};

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
  const [filter, setfilter] = useState("all");

  const [creating, setcreating] = useState(false);
  const [name, setname] = useState("");
  const [busy, setbusy] = useState(false);
  const [formError, setformError] = useState("");

  const load = () => {
    if (!authentication.user.token) return;
    setloading(true);
    seterror("");
    GetMessagesListRequest({
      token: authentication.user.token,
      // Filtered server-side rather than in the browser: the list is paginated,
      // so narrowing a single page here would show "10 conversations" and then
      // three of them.
      origins: FILTERS.find((f) => f.key === filter)?.origins ?? [],
    })
      .then(setconversations)
      // Was swallowed into a console.log, so a failed load looked exactly like
      // having no conversations.
      .catch((err) => seterror(err?.message ?? "Could not load conversations."))
      .finally(() => setloading(false));
  };

  useEffect(load, [authentication.user.token, ctx.organizationId, filter]);

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

      <div className="w-full flex flex-row items-center gap-[6px] flex-wrap">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            onClick={() => setfilter(option.key)}
            className={`text-[12px] h-[30px] px-[12px] rounded-[20px] border transition-colors ${
              filter === option.key
                ? "bg-black text-white border-black"
                : "bg-white text-[#525252] border-[#e5e5e5] hover:bg-[#fafafa]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ErrorNotice message={error} onRetry={load} />

      {loading ? (
        <Loading label="Loading conversations" />
      ) : conversations.results.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No conversations yet" : "Nothing here"}
          description={
            filter === "integrations"
              ? "Conversations from your bots and connected apps will show up here."
              : "Start one to try an agent out."
          }
          action={
            filter === "integrations" ? (
              <Button
                onClick={() => setfilter("all")}
                variant="outline"
                className="mt-[6px] h-[34px] text-[13px]"
              >
                Show all
              </Button>
            ) : (
              <Button
                onClick={openCreate}
                className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black"
              >
                New conversation
              </Button>
            )
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
              <div className="w-full flex flex-row items-start gap-[8px]">
                {/*
                  NO `flex` ON THIS SPAN, AND `min-w-0` IS LOAD-BEARING.
                  `line-clamp-N` works by setting `display:-webkit-box`, so a
                  `flex` class on the same element overrides it and the clamp
                  silently does nothing - which is why a long name here (a
                  Chatterloop conversation id is 20+ digits) wrapped to two
                  lines and pushed the badge out of the card. `flex-1` is a
                  flex-CHILD property and still applies without it, and
                  `min-w-0` undoes the auto minimum that would otherwise let
                  the content set the width regardless.
                */}
                <span className="text-[14px] font-semibold line-clamp-1 flex-1 min-w-0 break-all">
                  {conversation.name}
                </span>
                {/*
                  Only for the surfaces that are not ours. A "Neon platform"
                  badge on every one of a user's own chats is noise that makes
                  the two that are not theirs harder to spot, not easier.

                  `origin_label` is the platform's own wording rather than a
                  copy of it here, so the two cannot drift apart.
                */}
                {conversation.is_external && (
                  <span className="shrink-0">
                    <Badge tone={ORIGIN_TONE[conversation.origin] ?? "neutral"}>
                      {conversation.origin_label}
                    </Badge>
                  </span>
                )}
              </div>
              {/* Same conflict as the title above: `flex` would kill the clamp. */}
              <span className="text-[13px] text-[#525252] leading-[1.4] line-clamp-3 flex-1 min-w-0">
                {preview(conversation.latest_message?.content)}
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
