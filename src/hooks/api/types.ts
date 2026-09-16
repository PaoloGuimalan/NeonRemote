/**
 * The platform resources, as the API returns them.
 *
 * Two fields are deliberately absent from every type here and that is not an
 * oversight: `Tool.authentication` and `ProviderCredential.api_key` are
 * write-only on the server. They can be sent and never come back, so there is
 * no shape for the frontend to hold them in - which is the point. A type that
 * declared them would be describing a response that never arrives.
 */

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  address: string;
  contact_email: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count: number;
  is_owner: boolean;
}

export interface IMember {
  id: string;
  account_id: string;
  username: string;
  email: string;
  full_name: string;
  profile: string;
  entity_id: string | null;
  nickname: string | null;
  date_joined: string | null;
  is_owner: boolean;
}

export interface IProviderCredential {
  id: string;
  /** How a person tells two keys for one provider apart. */
  name: string | null;
  /** `name`, falling back to the provider's own name. */
  label: string;
  service: number;
  service_name: string;
  /** Last four characters only - enough to tell two keys apart, not to use one. */
  api_key_hint: string;
  has_api_key: boolean;
  /** Which key this provider falls back to when a bot names none. */
  is_default: boolean;
  is_embedding_default: boolean;
  is_active: boolean;
  /** Bots pinned to this key. They fall back to the default if it is deleted. */
  bot_count: number;
  created_at: string;
  updated_at: string;
}

export interface IEmbeddingStatus {
  configured: boolean;
  reason: string;
}

export interface IToolSummary {
  id: number;
  name: string;
  description: string;
  is_enabled: boolean;
}

export interface ITool extends IToolSummary {
  parameters_schema: Record<string, unknown> | null;
  headers_schema: Record<string, unknown> | null;
  api_endpoint: string | null;
  http_method: "GET" | "POST";
  param_type: "query" | "route" | "body";
  requires_auth: boolean;
  /** Whether a credential is stored. The credential itself never leaves the server. */
  has_authentication: boolean;
}

export interface IRoleSummary {
  id: number;
  name: string;
  description: string;
}

export interface IRole extends IRoleSummary {
  system_prompt: string;
  tools: IToolSummary[];
  agent_count: number;
}

export interface IAgent {
  uuid: string;
  name: string;
  slug: string;
  role: IRoleSummary | null;
  is_active: boolean;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

export interface IService {
  /** Numeric pk. What ProviderCredential.service refers to. */
  id: number;
  uuid: string;
  name: string;
}

export interface IModel {
  uuid: string;
  model: string;
  service_uuid: string;
  service_name: string;
}

export type KnowledgeStatus = "pending" | "indexing" | "indexed" | "failed";

/** An agent a document has been given to. Name included so the knowledge
 *  screen can say who can read a document without a second request. */
export interface IKnowledgeAgent {
  uuid: string;
  name: string;
}

export interface IKnowledgeDocument {
  id: string;
  title: string;
  source_name: string;
  content_type: string;
  size_bytes: number;
  status: KnowledgeStatus;
  error: string;
  chunk_count: number;
  /** Empty when shared. Many-to-many: a document can go to any number of
   *  agents, and an agent can hold any number of documents. */
  agents: IKnowledgeAgent[];
  /** Readable by every agent in the organization - the default. */
  is_shared: boolean;
  uploaded_by_username: string;
  created_at: string;
  updated_at: string;
}

export interface IKnowledgeDocumentDetail extends IKnowledgeDocument {
  content: string;
}

// Re-exported so a screen dealing with bots has one place to import from;
// connected identities predate the platform API and still live in hooks/interfaces.
export type { IConnectedAccount } from "../interfaces";

export type BotStatus = "provisioning" | "active" | "failed" | "deactivated";

/**
 * A credential as the API shows it.
 *
 * There is no `token` field and that is not an omission: the plaintext is
 * returned exactly once, by the endpoint that mints it, and never again. The
 * server can still decrypt it - the bot runtime needs it - but handing it back
 * through a listing would put it within reach of any XSS or over-broad
 * session. `prefix` is safe: it travels in the clear inside every token.
 */
export interface IChatterloopToken {
  id: string;
  name: string;
  prefix: string;
  masked: string;
  scopes: string[];
  expires_at: string | null;
  revoked_at: string | null;
  provisioned_at: string | null;
  last_verified_at: string | null;
  created_at: string;
  is_live: boolean;
}

export interface IChatterloopBot {
  id: string;
  entity_id: string;
  name: string;
  handle: string;
  description: string;
  status: BotStatus;
  status_reason: string;
  agent_uuid: string;
  agent_name: string;
  model_uuid: string;
  model_name: string;
  /** Blank means the organization's default key for this provider. */
  credential_id: string;
  credential_name: string;
  /** Live, with an agent AND a model. Each missing piece fails silently. */
  can_answer: boolean;
  /** The switch: should a supervisor hold an event stream for this bot? */
  is_online: boolean;
  online_changed_at: string | null;
  /**
   * Whether this bot answers OTHER BOTS, so two can work through a task
   * together. Off by default: bots that answer each other have no natural
   * stopping point, since every threaded reply re-addresses the other. When
   * on, a per-conversation turn budget bounds it, and a person speaking in the
   * conversation hands that budget back.
   */
  allow_bot_conversations: boolean;
  /** What SHOULD be true, from the database. */
  should_run: boolean;
  /**
   * What IS true, read from the lease in Redis. Distinct from `should_run`
   * because they disagree in the case that matters: a bot switched on with no
   * supervisor process running is "should_run, not running", and showing that
   * as plain "online" is how somebody spends an afternoon wondering why their
   * bot ignores them.
   */
  running: boolean | null;
  owner_name: string;
  owner_type: "personal" | "page";
  owner_entity_id: string;
  /** What developer_service resolves. May differ from `handle` - see IBotVerification. */
  verified_handle: string;
  handle_mismatch: boolean;
  last_verified_at: string | null;
  tokens: IChatterloopToken[];
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

/** Returned once, at mint time. */
export interface IMintedBot extends IChatterloopBot {
  token: string;
}

export interface IMintedToken extends IChatterloopToken {
  token: string;
}

/**
 * What /v1/whoami and the grant table together say.
 *
 * Two failures only this can reveal, both otherwise silent: a handle that
 * resolves to somebody else (so mentions never match), and a scope with no
 * matching entity grant (so every call 403s).
 */
export interface IBotVerification {
  ok: boolean;
  reason?: string;
  status_code?: number;
  entity_id?: string;
  handle?: string;
  scopes?: string[];
  handle_mismatch?: boolean;
  grants: { granted: string[]; missing: string[] };
}

export interface IHandleAvailability {
  handle: string;
  available: boolean;
  taken_by: string;
}
