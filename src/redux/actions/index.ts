import { ActionProp, FetchedDeviceDataInterface } from "@/hooks/interfaces";
import { SET_AUTHENTICATION, SET_COUNTER_ON_SSE_OPEN, SET_DEVICE_INFO, SET_DEVICE_LIST } from "../types";
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
        default:
            return state;
    }
}