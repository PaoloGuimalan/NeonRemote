import { FetchedDeviceDataInterface } from "@/hooks/interfaces";

export const authenticationstate = {
  auth: null,
  user: {
    id: "",
    username: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    birthdate: "",
    profile: "",
    gender: "",
    email: "",
    date_created: "",
    is_active: false,
    is_verified: false,
  },
};

export const fetchedDeviceDataState: FetchedDeviceDataInterface = {
  deviceID: "",
  deviceName: "",
  type: "",
  os: "",
  connectionToken: "",
  dateAdded: {
    date: "",
    time: "",
  },
  isActivated: true,
  isMounted: false,
  notifications: [],
  files: {
    directory: "",
    list: [],
  },
};
