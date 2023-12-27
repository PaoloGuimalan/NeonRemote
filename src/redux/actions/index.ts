import { ActionProp } from "@/hooks/interfaces";
import { SET_AUTHENTICATION } from "../types";
import { authenticationstate } from "./states";

export const setauthentication = (state = authenticationstate, action: ActionProp) => {
    switch(action.type){
        case SET_AUTHENTICATION:
            return action.payload.authentication;
        default:
            return state;
    }
}