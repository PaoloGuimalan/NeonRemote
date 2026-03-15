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
};
