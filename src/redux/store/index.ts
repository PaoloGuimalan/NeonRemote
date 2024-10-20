import { createStore, combineReducers } from "redux";
import {
  setauthentication,
  setcounteronsseopen,
  setdeviceinfo,
  setdevicelist,
  setongoingfiletransfer,
  setsystemlogs,
} from "../actions";

const combiner = combineReducers({
  authentication: setauthentication,
  counteronsseopen: setcounteronsseopen,
  devicelist: setdevicelist,
  deviceinfo: setdeviceinfo,
  systemlogs: setsystemlogs,
  ongoingfiletransfer: setongoingfiletransfer,
});

const store = createStore(combiner);

export default store;
