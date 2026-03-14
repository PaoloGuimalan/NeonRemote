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

const POST = {
  adddevice: "/access/adddevice",
  fetchfile: "/access/fetchfile",
};

export { AUTH, GET, POST };
