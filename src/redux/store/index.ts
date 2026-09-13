import { createStore, combineReducers } from "redux";
import { setauthentication, setcounteronsseopen } from "../actions";

const combiner = combineReducers({
  authentication: setauthentication,
  counteronsseopen: setcounteronsseopen,
});

const store = createStore(combiner);

export default store;
