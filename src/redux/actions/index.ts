/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionProp,
  FetchedDeviceDataInterface,
  OnGoingFileTransferItem,
  SystemLogsItem,
} from "@/hooks/interfaces";
import {
  SET_AUTHENTICATION,
  SET_COUNTER_ON_SSE_OPEN,
  SET_DEVICE_DIRECTORY,
  SET_DEVICE_DIRNPATH,
  SET_DEVICE_INFO,
  SET_DEVICE_LIST,
  SET_ONGOING_FILE_CHUNK,
  SET_ONGOING_FILE_TRANSFER,
  SET_SYSTEM_LOGS,
} from "../types";
import { authenticationstate, fetchedDeviceDataState } from "./states";

export const setauthentication = (
  state = authenticationstate,
  action: ActionProp
) => {
  switch (action.type) {
    case SET_AUTHENTICATION:
      return action.payload.authentication;
    default:
      return state;
  }
};

export const setcounteronsseopen = (state: number = 0, action: ActionProp) => {
  switch (action.type) {
    case SET_COUNTER_ON_SSE_OPEN:
      const newstate = state + 1;
      return newstate;
    default:
      return state;
  }
};

export const setdevicelist = (state: any[] = [], action: ActionProp) => {
  switch (action.type) {
    case SET_DEVICE_LIST:
      return action.payload.devicelist;
    default:
      return state;
  }
};

export const setdeviceinfo = (
  state: FetchedDeviceDataInterface = fetchedDeviceDataState,
  action: ActionProp
) => {
  switch (action.type) {
    case SET_DEVICE_INFO:
      return {
        ...state,
        ...action.payload.deviceinfo,
      };
    case SET_DEVICE_DIRECTORY:
      return {
        ...state,
        files: {
          ...state.files,
          directory: action.payload.directorypath,
        },
      };
    case SET_DEVICE_DIRNPATH:
      return {
        ...state,
        files: {
          ...state.files,
          ...action.payload.dirnpath,
        },
      };
    default:
      return state;
  }
};

export const setsystemlogs = (
  state: SystemLogsItem[] = [],
  action: ActionProp
) => {
  switch (action.type) {
    case SET_SYSTEM_LOGS:
      return [action.payload.newlog, ...state.reverse()];
    default:
      return state.reverse();
  }
};

export const setongoingfiletransfer = (
  state: OnGoingFileTransferItem[] = [],
  action: ActionProp
) => {
  switch (action.type) {
    case SET_ONGOING_FILE_TRANSFER:
      return [action.payload.newfiletransfer, ...state];
    case SET_ONGOING_FILE_CHUNK:
      const newstate = action.payload.newchunk.data;
      const newstateidentifier = action.payload.newchunk.metadata;
      const currentstatefilter = state.filter(
        (flt: OnGoingFileTransferItem) =>
          flt.deviceID === newstateidentifier.deviceID &&
          flt.file.path === newstateidentifier.path &&
          flt.file.filename === newstateidentifier.filename
      );

      const currentstatenonfilter = state.filter(
        (flt: OnGoingFileTransferItem) =>
          flt.file.path !== newstateidentifier.path &&
          flt.file.filename !== newstateidentifier.filename
      );

      if (currentstatefilter.length > 0) {
        currentstatefilter[0].file.parts.push(newstate);
        return [...currentstatenonfilter, ...currentstatefilter];
      }

      return state;
    default:
      return state;
  }
};
