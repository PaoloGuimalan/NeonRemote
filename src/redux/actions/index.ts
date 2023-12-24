import { SET_AUTHENTICATION } from "../types";
import { authenticationstate } from "./states";

interface ActionProp{
    type: string;
    payload: any
}

export const setauthentication = (state = authenticationstate, action: ActionProp) => {
    switch(action.type){
        case SET_AUTHENTICATION:
            return action.payload.authentication;
        default:
            return state;
    }
}