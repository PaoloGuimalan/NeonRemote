const AUTH = {
  login: "/api/user/auth",
  register: "/auth/register",
  refreshauth: "/api/user/auth",
  verification: "/auth/verification",
};

const GET = {
  getdevices: "/access/getdevices",
  getdeviceinfo: "/access/getdeviceinfo/",
  getdevicefiles: "/access/getdevicefiles/",
};

const CHAT = {
  list: "/api/messenger/list",
  messages: "/api/messenger/",
};

const CONVERSATION = {
  info: "/api/messenger/conversation/",
};

const POST = {
  adddevice: "/access/adddevice",
  fetchfile: "/access/fetchfile",
};

const TPAUTH = {
  auth: "/api/user/tp_auth",
};

export { AUTH, GET, POST, CHAT, CONVERSATION, TPAUTH };
