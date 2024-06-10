import { ActionProp, FetchedDeviceDataInterface, SystemLogsItem } from "@/hooks/interfaces";
import { SET_AUTHENTICATION, SET_COUNTER_ON_SSE_OPEN, SET_DEVICE_DIRECTORY, SET_DEVICE_DIRNPATH, SET_DEVICE_INFO, SET_DEVICE_LIST, SET_SYSTEM_LOGS } from "../types";
import { authenticationstate, fetchedDeviceDataState } from "./states";

export const setauthentication = (state = authenticationstate, action: ActionProp) => {
    switch(action.type){
        case SET_AUTHENTICATION:
            return action.payload.authentication;
        default:
            return state;
    }
}

export const setcounteronsseopen = (state: number = 0, action: ActionProp) => {
    switch(action.type){
        case SET_COUNTER_ON_SSE_OPEN:
            const newstate = state + 1;
            return newstate;
        default:
            return state;
    }
}

export const setdevicelist = (state : any[] = [], action: ActionProp) => {
    switch(action.type){
        case SET_DEVICE_LIST:
            return action.payload.devicelist;
        default:
            return state;
    }
}

export const setdeviceinfo = (state : FetchedDeviceDataInterface = fetchedDeviceDataState, action: ActionProp) => {
    switch(action.type){
        case SET_DEVICE_INFO:
            return {
                ...state,
                ...action.payload.deviceinfo
            };
        case SET_DEVICE_DIRECTORY:
            return {
                ...state,
                files: {
                    ...state.files,
                    directory: action.payload.directorypath
                }
            }
        case SET_DEVICE_DIRNPATH:
            return {
                ...state,
                files: {
                    ...state.files,
                    ...action.payload.dirnpath
                }
            }
        default:
            return state;
    }
}

export const setsystemlogs = (state: SystemLogsItem[] = [], action: ActionProp) => {
    switch(action.type){
        case SET_SYSTEM_LOGS:
            return [
                action.payload.newlog,
                ...state.reverse()
            ];
        default:
            return state.reverse();
    }
}