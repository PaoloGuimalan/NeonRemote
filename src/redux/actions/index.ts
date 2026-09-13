/* eslint-disable no-case-declarations */
import { ActionProp } from "@/hooks/interfaces";
import { SET_AUTHENTICATION, SET_COUNTER_ON_SSE_OPEN } from "../types";
import { authenticationstate } from "./states";

export const setauthentication = (
  state = authenticationstate,
  action: ActionProp,
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
      return state + 1;
    default:
      return state;
  }
};
