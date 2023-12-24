import { Dispatch } from "react"
import Axios from 'axios'
import { AUTH } from "./endpoints";
import sign from 'jwt-encode';
import { SET_AUTHENTICATION } from "@/redux/types";
import { AuthStateInterface } from "./interfaces";

const API = import.meta.env.VITE_REACT_API_URL;
const SECRET = import.meta.env.VITE_REACT_SECRET;

const LoginRequest = (params: any, dispatch: Dispatch<any>, authentication: AuthStateInterface) => {
    const encodedParams = sign(params, SECRET)
    const urlencoded = new URLSearchParams()
    urlencoded.append("token", encodedParams)

    Axios.post(`${API}${AUTH.login}`, urlencoded ,{
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then((response) => {
        if(response.data.success){
            var userdata = response.data.data[0];
            var authtoken = {
                _id: userdata._id,
                token: userdata.token,
                role_permissions: userdata.role_permissions,
                user_role: userdata.user_role,
                first_name: userdata.first_name,
                last_name: userdata.last_name
            }

            var encodedAuthToken = sign(authtoken, SECRET)
            localStorage.setItem("authtoken", encodedAuthToken)
            dispatch({
                type: SET_AUTHENTICATION,
                payload:{
                    authentication: {
                        auth: true,
                        user: authtoken
                    }
                }
            })
        }
        else{
            dispatch({
                type: SET_AUTHENTICATION,
                payload:{
                  authentication:{
                    ...authentication,
                    auth: false
                  }
                }
            })
            console.log(response.data)
        }
    }).catch((err) => {
        dispatch({
            type: SET_AUTHENTICATION,
            payload:{
              authentication:{
                ...authentication,
                auth: false
              }
            }
        })
        console.log(err)
    })
}

const LogoutRequest = (params: any, callback: () => void) => {
    const encodedParams = sign(params, SECRET)
    const urlencoded = new URLSearchParams()
    urlencoded.append("token", encodedParams)

    Axios.post(`${API}${AUTH.logout}`, urlencoded,{
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then((response) => {
        if(response.data.success){
            callback()
        }
    }).catch((err) => {
        console.log(err)
    })

    // callback()
}

export {
    LoginRequest,
    LogoutRequest
}