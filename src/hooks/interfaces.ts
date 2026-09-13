/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActionProp {
  type: string;
  payload: any;
}


export interface AuthTokenInterface {
  id: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  date_created: string;
  contact?: string | null;
  email: string;
  profile: string;
  token?: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthStateInterface {
  auth: boolean | null;
  user: AuthTokenInterface;
}









export interface IMessage {
  message_id: string;
  pending_id: string;
  message_type: "ai_reply" | "text" | "reply";
  content: string;
  created_at: string;
  deleted_at: string | null;
  conversation: string;
  sender: string | null;
  agent: number | null;
  replying_to: string | null;
  deleted_by: string | null;
  receivers: string[];
  seeners: string[];
}

export interface IPendingMessage {
  pending_id: string;
  message_type: "ai_reply" | "text" | "reply";
  content: string;
}

export interface IConversation {
  conversation_id: string;
  name: string;
  footprint: string | null;
  organization: string;
  created_by: string;
  created_at: string;
  latest_message: IMessage | null;
}

export interface IPagination<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** An external identity this account can publish bots as. */
export interface IConnectedAccount {
  id: string;
  provider: string;
  external_id: string;
  external_type: "user" | "realm";
  external_username: string;
  external_name: string;
  external_profile: string;
  metadata: { realm_id?: string; role?: string };
  connected_at: string;
  last_verified_at: string | null;
  is_active: boolean;
}

/**
 * A Chatterloop page that could be connected but has not been.
 *
 * Read live from Chatterloop each time - never stored in Neon unless the
 * user actually connects it, so a revoked admin role stops offering the page
 * on the next load rather than lingering.
 */
export interface IAvailablePage {
  realm_id: string;
  entity_id: string;
  name: string;
  slug: string;
  profile: string;
  role: string;
}
