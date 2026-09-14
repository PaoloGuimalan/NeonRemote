import { IConversation } from "./interfaces";

export const contextMenuState = {
  clientX: 0,
  clientY: 0,
  toggled: false,
  target: "none",
  data: null,
};

export const paginationstate = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export const defaultConversationState: IConversation = {
  conversation_id: "",
  latest_message: null,
  name: "",
  footprint: null,
  created_at: "",
  organization: "",
  created_by: "",
  // Native until the real conversation loads. The optimistic direction on
  // purpose: the composer is disabled for the other two, and briefly disabling
  // it on a thread that turns out to be your own would flicker the one control
  // this screen exists for.
  origin: "native",
  origin_label: "Neon platform",
  is_external: false,
};
