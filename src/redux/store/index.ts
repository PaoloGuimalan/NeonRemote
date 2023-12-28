import { createStore, combineReducers } from 'redux'
import { setauthentication, setdevicelist } from '../actions';

const combiner = combineReducers({
    authentication: setauthentication,
    devicelist: setdevicelist
})

const store = createStore(combiner)

export default store;