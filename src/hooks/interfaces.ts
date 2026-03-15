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
    parts: any[];
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
