import sign from 'jwt-encode'
import { Dispatch } from 'redux';
import { ActionProp, AuthStateInterface } from './interfaces';
import jwt_decode from 'jwt-decode'
import { SET_DEVICE_LIST } from '@/redux/types';

const API = import.meta.env.VITE_NEON_AI_API;
const SECRET = import.meta.env.VITE_JWT_SECRET;

var sseNtfsSource : EventSource | null = null

const SSENotificationsTRequest = (authentication: AuthStateInterface, dispatch: Dispatch<ActionProp>) => {
    const decodetoken : any = jwt_decode(authentication.user.token);
    const mutateToken = {
        ...decodetoken,
        connectionType: "remote"
    }
    const tokenizemutatedtoken = sign(mutateToken, SECRET);

    const payload = {
        token: tokenizemutatedtoken,
        type: "notifications"
    }

    const encodedPayload = sign(payload, SECRET)

    sseNtfsSource = new EventSource(`${API}/access/ssehandshake/${encodedPayload}`)
    
    sseNtfsSource.addEventListener('notifications', (e) => {
        const parsedresponse = JSON.parse(e.data)
        if(parsedresponse.auth){
            if(parsedresponse.status){
                const decodedResult = jwt_decode(parsedresponse.result)

                //play ringtone
                
                //execute notification handling
                console.log(decodedResult);
            }
        }
    })

    sseNtfsSource.addEventListener('devicelist', (e) => {
        const parsedresponse = JSON.parse(e.data)
        if(parsedresponse.status){
            const decodedResult: any = jwt_decode(parsedresponse.result)

            //play ringtone
            
            //execute notification handling
            // console.log(decodedResult.data);
            dispatch({
                type: SET_DEVICE_LIST,
                payload: {
                    devicelist: decodedResult.data
                }
            })
        }
    })
}

const CloseSSENotifications = () => {
    if(sseNtfsSource){
        sseNtfsSource.close();
    }
}

export {
    SSENotificationsTRequest,
    CloseSSENotifications
}