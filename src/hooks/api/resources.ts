/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Typed request modules, one group per resource.
 *
 * These replace the flat `requests.ts` for everything the platform API added.
 * Grouping them by resource rather than listing forty exported functions means
 * a screen imports `Agents` and gets exactly the calls that screen can make.
 */
import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm, ApiContext } from "./client";
import {
  IAgent,
  IBotVerification,
  IChatterloopBot,
  IChatterloopToken,
  IHandleAvailability,
  IMintedBot,
  IMintedToken,
  IEmbeddingStatus,
  IKnowledgeDocument,
  IKnowledgeDocumentDetail,
  IMember,
  IModel,
  IOrganization,
  IProviderCredential,
  IRole,
  IService,
  ITool,
} from "./types";

export const Organizations = {
  /** Every organization the caller belongs to. Needs no X-Organization header. */
  list: (ctx: ApiContext) =>
    apiGet<IOrganization[]>("/api/organization/", ctx, undefined, "Could not load your organizations."),

  create: (ctx: ApiContext, payload: { name: string; description?: string; website?: string }) =>
    apiPost<IOrganization>("/api/organization/", ctx, payload, "Could not create that organization."),

  current: (ctx: ApiContext) =>
    apiGet<IOrganization>("/api/organization/current", ctx, undefined, "Could not load this organization."),

  update: (ctx: ApiContext, payload: Partial<IOrganization>) =>
    apiPatch<IOrganization>("/api/organization/current", ctx, payload, "Could not save those changes."),
};

export const Members = {
  list: (ctx: ApiContext) =>
    apiGet<IMember[]>("/api/organization/members", ctx, undefined, "Could not load members."),

  add: (ctx: ApiContext, payload: { email: string; nickname?: string }) =>
    apiPost<IMember>("/api/organization/members", ctx, payload, "Could not add that member."),

  remove: (ctx: ApiContext, memberId: string) =>
    apiDelete<null>(`/api/organization/members/${memberId}`, ctx, "Could not remove that member."),
};

export const Credentials = {
  list: (ctx: ApiContext) =>
    apiGet<IProviderCredential[]>("/api/organization/credentials", ctx, undefined, "Could not load credentials."),

  /** Whether RAG can embed at all. See the Knowledge screen for why it matters. */
  embeddingStatus: (ctx: ApiContext) =>
    apiGet<IEmbeddingStatus>("/api/organization/credentials/embedding", ctx, undefined, "Could not check embedding."),

  create: (
    ctx: ApiContext,
    payload: {
      service: number;
      api_key: string;
      name?: string;
      is_default?: boolean;
      is_embedding_default?: boolean;
    },
  ) => apiPost<IProviderCredential>("/api/organization/credentials", ctx, payload, "Could not save that key."),

  update: (
    ctx: ApiContext,
    credentialId: string,
    payload: {
      api_key?: string;
      name?: string;
      is_default?: boolean;
      is_embedding_default?: boolean;
      is_active?: boolean;
    },
  ) =>
    apiPatch<IProviderCredential>(
      `/api/organization/credentials/${credentialId}`,
      ctx,
      payload,
      "Could not save that key.",
    ),

  remove: (ctx: ApiContext, credentialId: string) =>
    apiDelete<null>(`/api/organization/credentials/${credentialId}`, ctx, "Could not delete that key."),
};

export const Agents = {
  list: (ctx: ApiContext) => apiGet<IAgent[]>("/api/llm/agents", ctx, undefined, "Could not load agents."),

  get: (ctx: ApiContext, uuid: string) =>
    apiGet<IAgent>(`/api/llm/agents/${uuid}`, ctx, undefined, "Could not load that agent."),

  create: (ctx: ApiContext, payload: { name: string; slug?: string; role_id?: number | null }) =>
    apiPost<IAgent>("/api/llm/agents", ctx, payload, "Could not create that agent."),

  update: (
    ctx: ApiContext,
    uuid: string,
    payload: { name?: string; slug?: string; role_id?: number | null; is_active?: boolean },
  ) => apiPatch<IAgent>(`/api/llm/agents/${uuid}`, ctx, payload, "Could not save that agent."),

  /** Deactivates. Messages keep an FK to the agent that wrote them. */
  deactivate: (ctx: ApiContext, uuid: string) =>
    apiDelete<IAgent>(`/api/llm/agents/${uuid}`, ctx, "Could not deactivate that agent."),
};

export const Roles = {
  list: (ctx: ApiContext) => apiGet<IRole[]>("/api/llm/roles", ctx, undefined, "Could not load roles."),

  create: (
    ctx: ApiContext,
    payload: { name: string; description?: string; system_prompt: string; tool_ids?: number[] },
  ) => apiPost<IRole>("/api/llm/roles", ctx, payload, "Could not create that role."),

  update: (
    ctx: ApiContext,
    roleId: number,
    payload: { name?: string; description?: string; system_prompt?: string; tool_ids?: number[] },
  ) => apiPatch<IRole>(`/api/llm/roles/${roleId}`, ctx, payload, "Could not save that role."),

  remove: (ctx: ApiContext, roleId: number) =>
    apiDelete<null>(`/api/llm/roles/${roleId}`, ctx, "Could not delete that role."),
};

export interface ToolPayload {
  name: string;
  description?: string;
  api_endpoint?: string | null;
  http_method?: "GET" | "POST";
  param_type?: "query" | "route" | "body";
  requires_auth?: boolean;
  is_enabled?: boolean;
  parameters_schema?: Record<string, unknown> | null;
  headers_schema?: Record<string, unknown> | null;
  /** Write-only. Sending an empty string is how a stored credential is cleared. */
  authentication?: string;
}

export const Tools = {
  list: (ctx: ApiContext) => apiGet<ITool[]>("/api/llm/tools", ctx, undefined, "Could not load tools."),

  create: (ctx: ApiContext, payload: ToolPayload) =>
    apiPost<ITool>("/api/llm/tools", ctx, payload, "Could not create that tool."),

  update: (ctx: ApiContext, toolId: number, payload: Partial<ToolPayload>) =>
    apiPatch<ITool>(`/api/llm/tools/${toolId}`, ctx, payload, "Could not save that tool."),

  remove: (ctx: ApiContext, toolId: number) =>
    apiDelete<null>(`/api/llm/tools/${toolId}`, ctx, "Could not delete that tool."),
};

export const Catalogue = {
  services: (ctx: ApiContext) =>
    apiGet<IService[]>("/api/llm/services", ctx, undefined, "Could not load providers."),

  models: (ctx: ApiContext, serviceUuid?: string) =>
    apiGet<IModel[]>(
      "/api/llm/models",
      ctx,
      serviceUuid ? { service: serviceUuid } : undefined,
      "Could not load models.",
    ),
};

export const Knowledge = {
  list: (ctx: ApiContext) =>
    apiGet<IKnowledgeDocument[]>("/api/llm/knowledge", ctx, undefined, "Could not load documents."),

  get: (ctx: ApiContext, documentId: string) =>
    apiGet<IKnowledgeDocumentDetail>(
      `/api/llm/knowledge/${documentId}`,
      ctx,
      undefined,
      "Could not load that document.",
    ),

  createFromText: (
    ctx: ApiContext,
    payload: { title: string; content: string; agent_uuids?: string[] },
  ) => apiPost<IKnowledgeDocument>("/api/llm/knowledge", ctx, payload, "Could not index that document."),

  upload: (ctx: ApiContext, file: File, title?: string, agentUuids?: string[]) => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    // Comma-separated rather than repeated fields: multipart cannot carry a
    // JSON array, and the API accepts this shape for exactly that reason.
    if (agentUuids && agentUuids.length) form.append("agent_uuids", agentUuids.join(","));
    return apiPostForm<IKnowledgeDocument>("/api/llm/knowledge", ctx, form, "Could not index that file.");
  },

  /**
   * Change which agents may read a document.
   *
   * An empty array shares it with every agent again, which is the default
   * state - restricting a document must not be a one-way door.
   */
  setAgents: (ctx: ApiContext, documentId: string, agentUuids: string[]) =>
    apiPatch<IKnowledgeDocument>(
      `/api/llm/knowledge/${documentId}`,
      ctx,
      { agent_uuids: agentUuids },
      "Could not change who can read that document.",
    ),

  reindex: (ctx: ApiContext, documentId: string) =>
    apiPost<IKnowledgeDocument>(`/api/llm/knowledge/${documentId}`, ctx, undefined, "Could not re-index."),

  remove: (ctx: ApiContext, documentId: string) =>
    apiDelete<null>(`/api/llm/knowledge/${documentId}`, ctx, "Could not delete that document."),
};

/**
 * Conversations.
 *
 * The messenger routes predate the platform API and answer with a bare body
 * rather than the {status, data} envelope - the client passes those through
 * unchanged. They are here anyway so conversation creation carries the
 * X-Organization header, which it must: a conversation belongs to exactly one
 * organization, and a user in two would otherwise be told to name one.
 */
export const Conversations = {
  create: (ctx: ApiContext, payload: { name: string; footprint?: string | null }) =>
    apiPost<{ conversation_id: string }>(
      "/api/messenger/conversation",
      ctx,
      payload,
      "Could not start that conversation.",
    ),
};

export const Bots = {
  list: (ctx: ApiContext) =>
    apiGet<IChatterloopBot[]>("/api/chatterloop/bots", ctx, undefined, "Could not load bots."),

  /** The ONLY call that ever returns a token in the clear. */
  create: (
    ctx: ApiContext,
    payload: {
      name: string;
      handle: string;
      description?: string;
      agent_uuid?: string;
      model_uuid?: string;
      credential_id?: string;
      owner?: string;
      scopes?: string[];
    },
  ) => apiPost<IMintedBot>("/api/chatterloop/bots", ctx, payload, "Could not create that bot."),

  update: (
    ctx: ApiContext,
    botId: string,
    payload: {
      name?: string;
      description?: string;
      agent_uuid?: string;
      model_uuid?: string;
      credential_id?: string;
      allow_bot_conversations?: boolean;
    },
  ) =>
    apiPatch<IChatterloopBot>(`/api/chatterloop/bots/${botId}`, ctx, payload, "Could not save that bot."),

  /**
   * Let this bot answer other bots, or stop it.
   *
   * Switching it off is how a running collaboration is ended early - each bot
   * checks its own flag, so one of the pair going quiet is enough.
   */
  setBotConversations: (ctx: ApiContext, botId: string, allowed: boolean) =>
    apiPatch<IChatterloopBot>(
      `/api/chatterloop/bots/${botId}`,
      ctx,
      { allow_bot_conversations: allowed },
      "Could not change that setting.",
    ),

  /**
   * Start or stop this bot's event stream.
   *
   * Nothing else changes: the Chatterloop identity, the token and the agent
   * binding all survive, and switching back on needs no new credential. Quite
   * different from `deactivate`, which revokes.
   */
  setOnline: (ctx: ApiContext, botId: string, online: boolean) =>
    online
      ? apiPost<IChatterloopBot>(
          `/api/chatterloop/bots/${botId}/online`,
          ctx,
          undefined,
          "Could not switch that bot on.",
        )
      : apiDelete<IChatterloopBot>(
          `/api/chatterloop/bots/${botId}/online`,
          ctx,
          "Could not switch that bot off.",
        ),

  /** Deactivates and revokes. Never a hard delete - see the server's note. */
  deactivate: (ctx: ApiContext, botId: string) =>
    apiDelete<IChatterloopBot>(`/api/chatterloop/bots/${botId}`, ctx, "Could not deactivate that bot."),

  reactivate: (ctx: ApiContext, botId: string) =>
    apiPost<IChatterloopBot>(
      `/api/chatterloop/bots/${botId}/reactivate`,
      ctx,
      undefined,
      "Could not reactivate that bot.",
    ),

  verify: (ctx: ApiContext, botId: string) =>
    apiPost<IBotVerification>(
      `/api/chatterloop/bots/${botId}/verify`,
      ctx,
      undefined,
      "Could not verify that bot.",
    ),

  rotateToken: (ctx: ApiContext, botId: string, payload: { name?: string; scopes?: string[] } = {}) =>
    apiPost<IMintedToken>(
      `/api/chatterloop/bots/${botId}/tokens`,
      ctx,
      payload,
      "Could not issue a new token.",
    ),

  revokeToken: (ctx: ApiContext, botId: string, tokenId: string) =>
    apiDelete<IChatterloopToken>(
      `/api/chatterloop/bots/${botId}/tokens/${tokenId}`,
      ctx,
      "Could not revoke that token.",
    ),

  handleAvailable: (ctx: ApiContext, handle: string) =>
    apiGet<IHandleAvailability>(
      "/api/chatterloop/bots/handle-available",
      ctx,
      { handle },
      "Could not check that handle.",
    ),
};
