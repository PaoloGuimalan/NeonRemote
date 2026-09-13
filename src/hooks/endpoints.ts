const AUTH = {
  // Both forward to chatterloop: Neon no longer holds passwords, and there is
  // no registration or email-verification path here any more - an account is
  // created on chatterloop.
  login: "/api/user/auth",
  refreshauth: "/api/user/auth",
};

const CHAT = {
  list: "/api/messenger/list",
  messages: "/api/messenger/",
};

const CONVERSATION = {
  info: "/api/messenger/conversation/",
};

const TPAUTH = {
  auth: "/api/user/tp_auth",
};

const CONNECTIONS = {
  list: "/api/core/connections",
  availablePages: "/api/core/connections/pages/available",
  connectPage: "/api/core/connections/pages",
  detail: "/api/core/connections/",
};

export { AUTH, CHAT, CONVERSATION, TPAUTH, CONNECTIONS };
