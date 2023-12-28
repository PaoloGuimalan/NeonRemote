import { ActionProp } from "@/hooks/interfaces";
import { SET_AUTHENTICATION, SET_DEVICE_LIST } from "../types";
import { authenticationstate } from "./states";

export const setauthentication = (state = authenticationstate, action: ActionProp) => {
    switch(action.type){
        case SET_AUTHENTICATION:
            return action.payload.authentication;
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