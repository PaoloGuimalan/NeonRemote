/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ActionProp {
  type: string;
  payload: any;
}

export interface RegisterInterface {
  fullname: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
  birthdate: {
    month: string;
    day: string;
    year: string;
  };
  contact: string;
  email: string;
  password: string;
}

export interface AuthTokenInterface {
  userID: string;
  fullname: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
  birthdate: {
    month: string;
    day: string;
    year: string;
  };
  dateCreated: {
    date: string;
    time: string;
  };
  contact: string;
  email: string;
  profile: string;
  token: string;
  isActivated: boolean;
  isVerified: boolean;
}

export interface AuthStateInterface {
  auth: boolean | null;
  user: AuthTokenInterface;
}

export interface DialogWidgetProp {
  buttonlabel: string;
  icon: any;
}

export interface DeviceInfoInterface {
  deviceName: string;
  deviceType: string;
  os: string;
}

export interface DropdownMenuWidgetInterface {
  position: string;
  labels: any;
  list: any[];
  setPosition: (newType: string) => void;
}

export interface FetchedDeviceDataInterface {
  deviceID: string;
  deviceName: string;
  type: string;
  os: string;
  connectionToken: string;
  dateAdded: {
    date: string;
    time: string;
  };
  isActivated: boolean;
  isMounted: boolean;
  notifications: any[];
  files: {
    directory: string;
    list: any[];
  };
}

export interface OnGoingFileTransferItem {
  deviceID: string;
  toID: string;
  file: {
    totalChunks: number;
    mimeType: string;
    size: number;
    filename: string;
    path: string;
  };
}

export interface SystemLogsItem {
  deviceID: string;
  time: string;
  status: number;
  host: string;
  request: string;
  data: string;
}

export interface IDeviceContextMenu {
  clientX: number;
  clientY: number;
  toggled: boolean;
  target: string;
  data: IDeviceItems | null;
}

export interface IDeviceItems {
  filename: string;
  path: string | any;
  type: string;
}
