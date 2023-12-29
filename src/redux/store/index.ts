import { createStore, combineReducers } from 'redux'
import { setauthentication, setcounteronsseopen, setdeviceinfo, setdevicelist } from '../actions';

const combiner = combineReducers({
    authentication: setauthentication,
    counteronsseopen: setcounteronsseopen,
    devicelist: setdevicelist,
    deviceinfo: setdeviceinfo
})

const store = createStore(combiner)

export default store;