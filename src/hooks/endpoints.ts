const AUTH = {
  login: "/auth/login",
  register: "/auth/register",
  refreshauth: "/auth/refreshauth",
  verification: "/auth/verification",
};

const GET = {
  getdevices: "/access/getdevices",
  getdeviceinfo: "/access/getdeviceinfo/",
  getdevicefiles: "/access/getdevicefiles/",
};

const POST = {
  adddevice: "/access/adddevice",
  fetchfile: "/access/fetchfile",
};

export { AUTH, GET, POST };

