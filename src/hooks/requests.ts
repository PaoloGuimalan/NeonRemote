import { Dispatch } from "react"
import Axios from 'axios'
import { AUTH } from "./endpoints";
import sign from 'jwt-encode';
import { SET_AUTHENTICATION } from "@/redux/types";
import { AuthStateInterface } from "./interfaces";
import jwtDecode from "jwt-decode";

const API = import.meta.env.VITE_NEON_AI_API;
const SECRET = import.meta.env.VITE_JWT_SECRET;

const LoginRequest = (params: any, dispatch: Dispatch<any>, authentication: AuthStateInterface) => {
    const encodedParams = sign(params, SECRET)
    const urlencoded = new URLSearchParams()
    urlencoded.append("token", encodedParams)

    Axios.post(`${API}${AUTH.login}`, urlencoded ,{
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then((response) => {
        if(response.data.status){
            var decodedToken: any = jwtDecode(response.data.result);
            var userdata = decodedToken;
            var authtoken = {
                ...userdata,
                token: sign({
                    email: userdata.email,
                    userID: userdata.userID
                }, SECRET)
            };

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

const RegisterRequest = async (payload: any) => {
    const encodedpayload = sign(payload, SECRET);
    const urlencoded = new URLSearchParams()
    urlencoded.append("token", encodedpayload)

    return await Axios.post(`${API}${AUTH.register}`, urlencoded,{
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then((response) => {
        return response;
    }).catch((err) => {
        throw new Error(err);
    })
}

const RefreshAuthRequest = async (payload: any) => {
    const encodedpayload = payload;
    const urlencoded = new URLSearchParams()
    urlencoded.append("token", encodedpayload)

    return await Axios.post(`${API}${AUTH.refreshauth}`, urlencoded,{
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then((response) => {
        return response;
    }).catch((err) => {
        throw new Error(err);
    })
}

export {
    LoginRequest,
    RegisterRequest,
    RefreshAuthRequest
}