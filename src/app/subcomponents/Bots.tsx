/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Bots: an agent published to Chatterloop under an identity you control.
 *
 * THE TOKEN IS SHOWN ONCE
 * -----------------------
 * Chatterloop stores only a SHA-256 of it. Neon keeps the plaintext encrypted
 * because the bot runtime has to present it on every reconnect, but it is
 * never returned through a listing - so this screen puts it in a dialog the
 * user must actively dismiss, rather than a toast that disappears.
 *
 * VERIFY EXISTS BECAUSE TWO FAILURES ARE SILENT
 * ---------------------------------------------
 * A bot answering to a handle that resolves to somebody else matches no
 * mentions, and a scope with no matching entity grant 403s every call. Neither
 * shows up as an error anywhere - the bot simply never speaks. `Verify` asks
 * developer_service and the grant table directly, which is the only way to
 * see either.
 */
import { useState } from "react";
import { FiCheckCircle, FiCopy, FiKey, FiShield } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";

import { ConfirmDialog, FormDialog } from "@/app/widgets/Modal";
import {
  Badge,
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Grid,
  Loading,
  Notice,
  Page,
  PageHeader,
  Select,
} from "@/app/widgets/Shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Agents as AgentsApi,
  Bots as BotsApi,
  Catalogue,
  Credentials,
} from "@/hooks/api/resources";
import {
  IAgent,
  IBotVerification,
  IChatterloopBot,
  IChatterloopToken,
  IConnectedAccount,
  IModel,
  IProviderCredential,
} from "@/hooks/api/types";
import { GetConnectionsRequest } from "@/hooks/requests";
import { formatToWords } from "@/hooks/reusables";
import { useResource } from "@/hooks/useResource";

const STATUS_TONES: Record<string, "neutral" | "good" | "warn" | "bad"> = {
  provisioning: "warn",
  active: "good",
  failed: "bad",
  deactivated: "neutral",
};

const SCOPE_LABELS: Record<string, string> = {
  "events.subscribe": "Receive events",
  "messages.read": "Read messages",
  "notifications.read": "Read mentions",
  "messages.send": "Send messages",
  "comments.create": "Write comments",
};

function TokenOnceDialog({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast({ title: "Copied" });
    } catch {
      // Clipboard access can be refused outright. Not worth an error - the
      // value is on screen and selectable.
      toast({ title: "Select and copy it manually", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="font-Inter max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[17px]">Copy this token now</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[12px]">
          <Notice>
            <span>
              This is the only time it is shown. Chatterloop stores only a hash of
              it, so it cannot be recovered — if you lose it, issue a replacement.
            </span>
          </Notice>

          <div className="flex flex-row items-center gap-[8px]">
            <code className="flex flex-1 text-[12px] font-mono bg-[#f7f8fa] border-[1px] border-[#e5e6ea] rounded-[7px] p-[10px] break-all select-all">
              {token}
            </code>
            <Button variant="outline" className="h-[36px] shrink-0 gap-[5px]" onClick={copy}>
              <FiCopy style={{ fontSize: "14px" }} />
              <span className="text-[12px]">Copy</span>
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="h-[38px] text-[13px] bg-black text-white hover:bg-black"
          >
            I have copied it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VerificationPanel({ result }: { result: IBotVerification }) {
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-[6px] rounded-[7px] bg-[#fdf3f2] p-[10px]">
        <span className="text-[12px] font-semibold text-[#8c2f27]">
          Chatterloop rejected this token{result.status_code ? ` (${result.status_code})` : ""}
        </span>
        <span className="text-[12px] text-[#8c2f27]">{result.reason}</span>
        {result.grants?.missing?.length > 0 && (
          <span className="text-[12px] text-[#8c2f27]">
            Missing grants: {result.grants.missing.join(", ")}
          </span>
        )}
      </div>
    );
  }

  const missing = result.grants?.missing ?? [];
  return (
    <div className="flex flex-col gap-[6px] rounded-[7px] bg-[#f7f8fa] p-[10px]">
      <div className="flex flex-row items-center gap-[6px]">
        <FiCheckCircle style={{ fontSize: "14px", color: "#1f7a3f" }} />
        <span className="text-[12px] font-semibold">
          Authenticated as @{result.handle}
        </span>
      </div>
      {result.handle_mismatch && (
        <span className="text-[12px] text-[#8a6100]">
          Chatterloop resolves this handle to a different identity, so mentions of
          your bot will not reach it. Handles are shared between people, pages and
          bots — this one is taken.
        </span>
      )}
      {missing.length > 0 ? (
        <span className="text-[12px] text-[#8a6100]">
          These scopes are on the token but not granted to its entity, so calls
          using them return 403: {missing.join(", ")}
        </span>
      ) : (
        <span className="text-[12px] text-[#4b5563]">
          Every scope has a matching grant.
        </span>
      )}
    </div>
  );
}

function OnlineSwitch({
  bot,
  busy,
  onToggle,
}: {
  bot: IChatterloopBot;
  busy: boolean;
  onToggle: (online: boolean) => void;
}) {
  const on = bot.is_online;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy || bot.status === "deactivated"}
      onClick={() => onToggle(!on)}
      title={
        bot.status === "deactivated"
          ? "Reactivate this bot before switching it on."
          : on
            ? "Stop listening. The token stays valid."
            : "Start listening again."
      }
      className={`relative w-[38px] h-[22px] rounded-full shrink-0 transition-colors disabled:opacity-40 ${
        on ? "bg-[#1f7a3f]" : "bg-[#c9ccd4]"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all ${
          on ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function RunState({ bot }: { bot: IChatterloopBot }) {
  // Lifecycle first: a bot that never finished provisioning, or failed to,
  // has a problem the on/off switch cannot describe.
  if (bot.status !== "active") {
    return <Badge tone={STATUS_TONES[bot.status] ?? "neutral"}>{bot.status}</Badge>;
  }
  if (!bot.is_online) {
    return <Badge>offline</Badge>;
  }
  if (!bot.can_answer) {
    return <Badge tone="warn">online, cannot reply</Badge>;
  }
  // Switched on and able to answer, but nothing is holding its lease. Almost
  // always means no supervisor is running - worth saying, because from the
  // outside it is indistinguishable from a bot that is simply ignoring you.
  if (bot.running === false) {
    return <Badge tone="warn">online, not running</Badge>;
  }
  return <Badge tone="good">listening</Badge>;
}


/**
 * The bot's control endpoint, as two links somebody can copy.
 *
 * WHY IT LIVES ON THE CARD
 * ------------------------
 * This is the one thing about a bot that is used OUTSIDE Neon - pasted into a
 * cron job, a deploy script, or chatterloop's own /wake. Putting it behind a
 * dialog would mean nobody discovers it, and the whole point of a prebuilt
 * endpoint is that it is there without being asked for.
 *
 * NOTHING IS FETCHED. Both the URL and the key arrive with the bot, so the
 * card costs no request.
 *
 * THE KEY IS A CREDENTIAL, shown because the URLs are useless without it - a
 * pair of links nobody can call is worse than none. It is masked until asked
 * for, which does not make it secret (it is in the payload either way) but
 * does keep it out of the screenshot somebody takes of their bot list.
 */
function ControlEndpoint({ bot }: { bot: IChatterloopBot }) {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);

  if (!bot.control_url) return null;

  const copy = async (url: string, what: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: what === "key" ? "Copied the key" : `Copied the ${what} URL` });
    } catch {
      // A clipboard write can be refused outright - an insecure origin, or a
      // browser that wants a user gesture it did not see. The text is
      // selectable, so say so rather than failing silently.
      toast({ title: "Select and copy it manually", variant: "destructive" });
    }
  };

  return (
    <Field label="Control endpoint">
      <div className="flex flex-col gap-[6px]">
        {(["wake", "sleep"] as const).map((action) => {
          const url = `${bot.control_url}?action=${action}`;
          return (
            <div key={action} className="flex flex-row items-center gap-[6px]">
              <code
                className="flex-1 min-w-0 text-[11px] font-mono bg-[#f7f8fa] border-[1px] border-[#e5e6ea] rounded-[6px] px-[8px] py-[6px] truncate select-all"
                title={url}
              >
                {url}
              </code>
              <Button
                variant="outline"
                className="h-[30px] shrink-0 gap-[4px] px-[8px]"
                onClick={() => copy(url, action)}
              >
                <FiCopy style={{ fontSize: "12px" }} />
                <span className="text-[11px]">Copy</span>
              </Button>
            </div>
          );
        })}
        {bot.control_key && (
          <div className="flex flex-row items-center gap-[6px]">
            <code className="flex-1 min-w-0 text-[11px] font-mono bg-[#f7f8fa] border-[1px] border-[#e5e6ea] rounded-[6px] px-[8px] py-[6px] truncate select-all">
              {showKey ? bot.control_key : "•".repeat(24)}
            </code>
            <Button
              variant="outline"
              className="h-[30px] shrink-0 px-[8px]"
              onClick={() => setShowKey((was) => !was)}
            >
              <span className="text-[11px]">{showKey ? "Hide" : "Show"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-[30px] shrink-0 gap-[4px] px-[8px]"
              onClick={() => copy(bot.control_key, "key")}
            >
              <FiCopy style={{ fontSize: "12px" }} />
              <span className="text-[11px]">Copy</span>
            </Button>
          </div>
        )}

        <span className="text-[11px] text-[#767676]">
          POST either URL with{" "}
          <code className="font-mono">Authorization: Bearer &lt;key&gt;</code> to
          start or stop this bot from anywhere. Nothing else changes - the
          token, the agent binding and the identity all survive.
        </span>
      </div>
    </Field>
  );
}

function Bots() {
  const { toast } = useToast();

  const bots = useResource<IChatterloopBot[]>((ctx) => BotsApi.list(ctx), []);
  const agents = useResource<IAgent[]>((ctx) => AgentsApi.list(ctx), []);
  const models = useResource<IModel[]>((ctx) => Catalogue.models(ctx), []);
  const credentials = useResource<IProviderCredential[]>(
    (ctx) => Credentials.list(ctx),
    [],
  );
  const connections = useResource<{ connections: IConnectedAccount[] }>(
    async (ctx) => GetConnectionsRequest({ token: ctx.token }),
    { connections: [] },
  );

  const [creating, setcreating] = useState(false);
  const [name, setname] = useState("");
  const [handle, sethandle] = useState("");
  const [description, setdescription] = useState("");
  const [agentUuid, setagentUuid] = useState("");
  const [modelUuid, setmodelUuid] = useState("");
  const [credentialId, setcredentialId] = useState("");
  const [owner, setowner] = useState("personal");
  const [handleState, sethandleState] = useState<{ checked: string; message: string }>({
    checked: "",
    message: "",
  });

  const [mintedToken, setmintedToken] = useState("");
  const [deactivating, setdeactivating] = useState<IChatterloopBot | null>(null);
  const [revoking, setrevoking] = useState<{ bot: IChatterloopBot; token: IChatterloopToken } | null>(
    null,
  );
  const [verifications, setverifications] = useState<Record<string, IBotVerification>>({});
  const [busy, setbusy] = useState(false);
  const [switching, setswitching] = useState("");
  const [formError, setformError] = useState("");

  const pages = (connections.data.connections ?? []).filter(
    (row) => row.external_type === "realm",
  );

  const openCreate = () => {
    setname("");
    sethandle("");
    setdescription("");
    setagentUuid(agents.data.find((a) => a.is_active)?.uuid ?? "");
    setmodelUuid(models.data[0]?.uuid ?? "");
    setcredentialId("");
    setowner("personal");
    sethandleState({ checked: "", message: "" });
    setformError("");
    setcreating(true);
  };

  // Checked on blur rather than per keystroke: it is a database round trip
  // across three tables, and the server re-checks at mint time anyway - this
  // is a courtesy, not the guard.
  const checkHandle = async () => {
    const candidate = handle.trim().replace(/^@/, "");
    if (!candidate || candidate === handleState.checked) return;
    try {
      const result = await BotsApi.handleAvailable(bots.ctx, candidate);
      sethandleState({
        checked: candidate,
        message: result.available ? "" : `Taken by ${result.taken_by}.`,
      });
    } catch {
      sethandleState({ checked: candidate, message: "" });
    }
  };

  const submit = async () => {
    setbusy(true);
    setformError("");
    try {
      const minted = await BotsApi.create(bots.ctx, {
        name: name.trim(),
        handle: handle.trim().replace(/^@/, ""),
        description: description.trim(),
        agent_uuid: agentUuid,
        model_uuid: modelUuid,
        credential_id: credentialId,
        owner,
      });
      setcreating(false);
      setmintedToken(minted.token);
      bots.reload();
    } catch (err: any) {
      setformError(err?.message ?? "Could not create that bot.");
    } finally {
      setbusy(false);
    }
  };

  const toggleBotChat = async (bot: IChatterloopBot, allowed: boolean) => {
    setswitching(bot.id);
    try {
      await BotsApi.setBotConversations(bots.ctx, bot.id, allowed);
      toast({
        title: allowed
          ? `@${bot.handle} can work with other bots`
          : `@${bot.handle} will ignore other bots`,
        description: allowed
          ? "Both bots need this on. A conversation runs until the task is done or the turn budget is spent."
          : "Any exchange it is in stops after its current turn.",
      });
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not change that", description: err?.message, variant: "destructive" });
    } finally {
      setswitching("");
    }
  };

  const toggleOnline = async (bot: IChatterloopBot, online: boolean) => {
    setswitching(bot.id);
    try {
      const updated = await BotsApi.setOnline(bots.ctx, bot.id, online);
      toast({
        title: online ? `@${bot.handle} is listening` : `@${bot.handle} is offline`,
        description: online
          ? undefined
          : "Its token is still valid — switch it back on any time.",
      });
      // Optimism would be wrong here: the server decides, and it also reports
      // whether anything is actually running the bot.
      void updated;
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not change that", description: err?.message, variant: "destructive" });
    } finally {
      setswitching("");
    }
  };

  const bind = async (bot: IChatterloopBot, patch: Record<string, string>) => {
    try {
      await BotsApi.update(bots.ctx, bot.id, patch);
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not change that", description: err?.message, variant: "destructive" });
    }
  };

  const verify = async (bot: IChatterloopBot) => {
    try {
      const result = await BotsApi.verify(bots.ctx, bot.id);
      setverifications((current) => ({ ...current, [bot.id]: result }));
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not verify", description: err?.message, variant: "destructive" });
    }
  };

  const rotate = async (bot: IChatterloopBot) => {
    try {
      const minted = await BotsApi.rotateToken(bots.ctx, bot.id);
      setmintedToken(minted.token);
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not issue a token", description: err?.message, variant: "destructive" });
    }
  };

  const reactivate = async (bot: IChatterloopBot) => {
    try {
      await BotsApi.reactivate(bots.ctx, bot.id);
      toast({ title: `${bot.name} reactivated`, description: "Issue a new token — the old ones stay revoked." });
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not reactivate", description: err?.message, variant: "destructive" });
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    setbusy(true);
    try {
      await BotsApi.deactivate(bots.ctx, deactivating.id);
      toast({ title: `${deactivating.name} deactivated` });
      setdeactivating(null);
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not deactivate", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revoking) return;
    setbusy(true);
    try {
      await BotsApi.revokeToken(bots.ctx, revoking.bot.id, revoking.token.id);
      toast({ title: "Token revoked" });
      setrevoking(null);
      bots.reload();
    } catch (err: any) {
      toast({ title: "Could not revoke", description: err?.message, variant: "destructive" });
    } finally {
      setbusy(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Bots"
        description="Publish an agent to Chatterloop. It answers mentions and direct messages as the identity you choose."
        action={
          <Button
            onClick={openCreate}
            className="gap-[5px] text-[12px] h-[35px] bg-black text-white hover:bg-black"
          >
            <IoMdAdd style={{ fontSize: "15px" }} />
            <span>New bot</span>
          </Button>
        }
      />

      <ErrorNotice message={bots.error} onRetry={bots.reload} />

      {bots.loading ? (
        <Loading label="Loading bots" />
      ) : bots.data.length === 0 ? (
        <EmptyState
          title="No bots yet"
          description="A bot gives one of your agents a Chatterloop identity, so people can talk to it there."
          action={
            <Button
              onClick={openCreate}
              className="mt-[6px] h-[34px] text-[13px] bg-black text-white hover:bg-black"
            >
              New bot
            </Button>
          }
        />
      ) : (
        <Grid>
          {bots.data.map((bot) => {
            const live = bot.tokens.filter((token) => token.is_live);
            return (
              <Card key={bot.id} className="xl:col-span-1">
                <div className="flex flex-row items-start gap-[8px]">
                  <div className="flex flex-col flex-1 gap-[2px] min-w-0">
                    <span className="text-[14px] font-semibold truncate">{bot.name}</span>
                    <span className="text-[12px] text-[#767676]">@{bot.handle}</span>
                  </div>
                  <div className="flex flex-col items-end gap-[6px] shrink-0">
                    <OnlineSwitch
                      bot={bot}
                      busy={switching === bot.id}
                      onToggle={(online) => toggleOnline(bot, online)}
                    />
                    <RunState bot={bot} />
                  </div>
                </div>

                {bot.is_online === false && bot.online_changed_at && (
                  <span className="text-[12px] text-[#767676]">
                    Offline since {formatToWords(bot.online_changed_at)} — nothing is
                    deleted, and its token still works.
                  </span>
                )}

                <label className="flex flex-row items-start gap-[8px] text-[12px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-[2px]"
                    checked={bot.allow_bot_conversations}
                    disabled={switching === bot.id || bot.status !== "active"}
                    onChange={(e) => toggleBotChat(bot, e.target.checked)}
                  />
                  <span className="flex flex-col gap-[2px]">
                    <span>Work with other bots</span>
                    <span className="text-[11px] text-[#767676]">
                      {bot.allow_bot_conversations
                        ? "Answers other bots so they can work a task through together. Both bots need this on; turn it off to stop one mid-conversation."
                        : "Ignores other bots. Only people can start a conversation with it."}
                    </span>
                  </span>
                </label>

                {bot.status === "failed" && bot.status_reason && (
                  <span className="text-[12px] text-[#8c2f27] bg-[#fdf3f2] rounded-[6px] p-[8px] line-clamp-3">
                    {bot.status_reason}
                  </span>
                )}
                {bot.status === "deactivated" && bot.status_reason && (
                  <span className="text-[12px] text-[#767676]">{bot.status_reason}</span>
                )}

                <div className="flex flex-row items-center gap-[6px] text-[12px] text-[#4b5563]">
                  <FiShield style={{ fontSize: "13px" }} />
                  <span>
                    Speaks as {bot.owner_name}
                    {bot.owner_type === "page" ? " (page)" : ""}
                  </span>
                </div>

                <Field label="Answers with">
                  <Select
                    value={bot.agent_uuid || ""}
                    onChange={(value) => bind(bot, { agent_uuid: value })}
                    className="h-[32px] text-[12px]"
                  >
                    <option value="">No agent</option>
                    {agents.data
                      .filter((agent) => agent.is_active)
                      .map((agent) => (
                        <option key={agent.uuid} value={agent.uuid}>
                          {agent.name}
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field label="Billing to">
                  <Select
                    value={bot.credential_id || ""}
                    onChange={(value) => bind(bot, { credential_id: value })}
                    className="h-[32px] text-[12px]"
                  >
                    <option value="">Organization default</option>
                    {credentials.data
                      .filter((c) => c.has_api_key)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                          {c.is_default ? " (default)" : ""}
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field label="Using model">
                  <Select
                    value={bot.model_uuid || ""}
                    onChange={(value) => bind(bot, { model_uuid: value })}
                    className="h-[32px] text-[12px]"
                  >
                    <option value="">No model</option>
                    {models.data.map((model) => (
                      <option key={model.uuid} value={model.uuid}>
                        {model.service_name} · {model.model}
                      </option>
                    ))}
                  </Select>
                </Field>

                <ControlEndpoint bot={bot} />

                {bot.status === "active" && bot.is_online && !bot.can_answer && (
                  <span className="text-[12px] text-[#8a6100] bg-[#fdf4e3] rounded-[6px] p-[8px]">
                    This bot is connected and receiving messages, but it has
                    {!bot.agent_uuid ? " no agent" : ""}
                    {!bot.agent_uuid && !bot.model_uuid ? " and" : ""}
                    {!bot.model_uuid ? " no model" : ""} — so it will never
                    reply, silently.
                  </span>
                )}

                <div className="flex flex-col gap-[5px]">
                  <div className="flex flex-row items-center gap-[6px]">
                    <FiKey style={{ fontSize: "13px", color: "#767676" }} />
                    <span className="text-[12px] font-semibold flex flex-1">
                      {live.length} live token{live.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {live.map((token) => (
                    <div
                      key={token.id}
                      className="flex flex-row items-center gap-[8px] text-[12px] bg-[#f7f8fa] rounded-[6px] px-[8px] py-[6px]"
                    >
                      <code className="font-mono flex flex-1 truncate">{token.masked}</code>
                      <span className="text-[#767676] hidden md:flex">
                        {formatToWords(token.created_at)}
                      </span>
                      <button
                        onClick={() => setrevoking({ bot, token })}
                        className="text-[#c0392b] font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                  {live.length === 0 && bot.status !== "failed" && (
                    <span className="text-[12px] text-[#8a6100]">
                      No live token — this bot cannot connect until you issue one.
                    </span>
                  )}
                </div>

                {verifications[bot.id] && <VerificationPanel result={verifications[bot.id]} />}

                <div className="flex flex-row flex-wrap gap-[6px] pt-[4px]">
                  <Button
                    variant="outline"
                    className="h-[30px] text-[12px]"
                    onClick={() => verify(bot)}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="outline"
                    className="h-[30px] text-[12px]"
                    onClick={() => rotate(bot)}
                  >
                    New token
                  </Button>
                  <div className="flex flex-1" />
                  {bot.status === "deactivated" ? (
                    <Button
                      variant="outline"
                      className="h-[30px] text-[12px]"
                      onClick={() => reactivate(bot)}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-[30px] text-[12px] text-[#c0392b]"
                      onClick={() => setdeactivating(bot)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </Grid>
      )}

      <FormDialog
        wide
        open={creating}
        onOpenChange={setcreating}
        title="New bot"
        description="This creates a real identity on Chatterloop. Its handle cannot be changed afterwards."
        error={formError}
        submitLabel="Create bot"
        submitting={busy}
        disabled={!name.trim() || !handle.trim()}
        onSubmit={submit}
      >
        <Field label="Name" hint="What people see next to its messages.">
          <Input value={name} autoFocus onChange={(e) => setname(e.target.value)} />
        </Field>

        <Field
          label="Handle"
          hint="How people mention it. Chosen once — changing it later would break every existing mention."
          error={handleState.message}
        >
          <Input
            value={handle}
            placeholder="acme-support"
            onBlur={checkHandle}
            onChange={(e) => sethandle(e.target.value)}
          />
        </Field>

        <Field label="Speaks as" hint="Whose name the bot posts under.">
          <Select value={owner} onChange={setowner}>
            <option value="personal">You, personally</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.external_name} (page)
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Answers with"
          hint={
            agents.data.length === 0
              ? "No agents yet — create one first, or the bot will have nothing to say."
              : "The agent whose role and tools generate its replies."
          }
        >
          <Select value={agentUuid} onChange={setagentUuid}>
            <option value="">No agent yet</option>
            {agents.data
              .filter((agent) => agent.is_active)
              .map((agent) => (
                <option key={agent.uuid} value={agent.uuid}>
                  {agent.name}
                </option>
              ))}
          </Select>
        </Field>

        <Field
          label="Using model"
          hint={
            models.data.length === 0
              ? "No models in the catalogue yet."
              : "Which model generates its replies. A bot answers unattended, so this is worth choosing rather than inheriting."
          }
        >
          <Select value={modelUuid} onChange={setmodelUuid}>
            <option value="">No model yet</option>
            {models.data.map((model) => (
              <option key={model.uuid} value={model.uuid}>
                {model.service_name} · {model.model}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Billing to"
          hint="Leave on the default unless this bot's spend needs to be separated from the rest."
        >
          <Select value={credentialId} onChange={setcredentialId}>
            <option value="">Organization default</option>
            {credentials.data
              .filter((c) => c.has_api_key)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                  {c.is_default ? " (default)" : ""}
                </option>
              ))}
          </Select>
        </Field>

        <Field label="Description" hint="Optional.">
          <Textarea value={description} rows={2} onChange={(e) => setdescription(e.target.value)} />
        </Field>

        <Notice>
          <span>
            The bot is created with every capability it needs to hold a conversation:{" "}
            {Object.values(SCOPE_LABELS).join(", ").toLowerCase()}.
          </span>
          <span>Its token is shown once, immediately after creation.</span>
        </Notice>
      </FormDialog>

      {mintedToken && (
        <TokenOnceDialog token={mintedToken} onClose={() => setmintedToken("")} />
      )}

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setdeactivating(null)}
        title={`Deactivate ${deactivating?.name}?`}
        confirmLabel="Deactivate"
        working={busy}
        consequence={
          <>
            <span>
              It stops answering on Chatterloop, and every token it holds is revoked
              immediately.
            </span>
            <span>
              You can reactivate it later, but the revoked tokens stay revoked — you
              would issue a new one.
            </span>
          </>
        }
        onConfirm={confirmDeactivate}
      />

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setrevoking(null)}
        title="Revoke this token?"
        confirmLabel="Revoke"
        working={busy}
        consequence={
          <>
            <span>
              Anything using <code className="font-mono">{revoking?.token.masked}</code> stops
              working at once. This cannot be undone.
            </span>
            {revoking && revoking.bot.tokens.filter((t) => t.is_live).length === 1 && (
              <span className="font-semibold">
                This is the bot's only live token, so it will go offline until you issue
                another.
              </span>
            )}
          </>
        }
        onConfirm={confirmRevoke}
      />
    </Page>
  );
}

export default Bots;
