/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from "react";
import Axios from "axios";
import { AUTH, GET, POST } from "./endpoints";
import sign from "jwt-encode";
import { SET_AUTHENTICATION } from "@/redux/types";
import { AuthStateInterface } from "./interfaces";
import jwtDecode from "jwt-decode";

const API = import.meta.env.VITE_NEON_AI_API;
const SECRET = import.meta.env.VITE_JWT_SECRET;

const LoginRequest = (
  params: any,
  dispatch: Dispatch<any>,
  authentication: AuthStateInterface
) => {
  const encodedParams = sign(params, SECRET);
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", encodedParams);

  Axios.post(`${API}${AUTH.login}`, urlencoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (response.data.status) {
        const decodedToken: any = jwtDecode(response.data.result);
        const userdata = decodedToken;
        const authtoken = {
          ...userdata,
          token: sign(
            {
              email: userdata.email,
              userID: userdata.userID,
            },
            SECRET
          ),
        };

        const encodedAuthToken = sign(authtoken, SECRET);
        localStorage.setItem("authtoken", encodedAuthToken);
        dispatch({
          type: SET_AUTHENTICATION,
          payload: {
            authentication: {
              auth: true,
              user: authtoken,
            },
          },
        });
      } else {
        dispatch({
          type: SET_AUTHENTICATION,
          payload: {
            authentication: {
              ...authentication,
              auth: false,
            },
          },
        });
        console.log(response.data);
      }
    })
    .catch((err) => {
      dispatch({
        type: SET_AUTHENTICATION,
        payload: {
          authentication: {
            ...authentication,
            auth: false,
          },
        },
      });
      console.log(err);
    });
};

const RegisterRequest = async (payload: any) => {
  const encodedpayload = sign(payload, SECRET);
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", encodedpayload);

  return await Axios.post(`${API}${AUTH.register}`, urlencoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      const mutatedresponse = {
        ...response,
        SECRET: SECRET,
      };
      return mutatedresponse;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const RefreshAuthRequest = async (payload: any) => {
  const encodedpayload = payload;

  return await Axios.get(`${API}${AUTH.refreshauth}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": encodedpayload,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const VerificationRequest = async (payload: any) => {
  const encodedpayload = sign(payload, SECRET);
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", encodedpayload);

  return await Axios.post(`${API}${AUTH.verification}`, urlencoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      const mutatedresponse = {
        ...response,
        SECRET: SECRET,
      };
      return mutatedresponse;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const AddDeviceRequest = async (payload: any) => {
  const initialpayload = payload.data;
  const authtoken = payload.token;
  const encodedpayload = sign(initialpayload, SECRET);
  const urlencoded = new URLSearchParams();
  urlencoded.append("token", encodedpayload);

  return await Axios.post(`${API}${POST.adddevice}`, urlencoded, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": authtoken,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const GetDevicesRequest = async (params: any) => {
  const authtoken = params.token;

  return await Axios.get(`${API}${GET.getdevices}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": authtoken,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const GetDeviceInfoRequest = async (params: any) => {
  const authtoken = params.token;
  const deviceID = params.deviceID;

  return await Axios.get(`${API}${GET.getdeviceinfo}${deviceID}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": authtoken,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const GetDeviceFilesRequest = async (params: any) => {
  const authtoken = params.token;
  const deviceparams = params.idwithdir;
  const encodedparams = sign(deviceparams, SECRET);

  return await Axios.get(`${API}${GET.getdevicefiles}${encodedparams}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-access-token": authtoken,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const GetFetchFileRequest = async (params: any) => {
  const authtoken = params.token;
  const deviceparams = params.handshake;
  const encodedparams = sign(deviceparams, SECRET);
  //ENCODED PARAMS

  /**
     * {
        deviceID: `DVC_${deviceData.deviceID}`,
        path: currentPath,
        filename: string
      }
    */

  //ENCODED PARAMS END

  return await Axios.post(
    `${API}${POST.fetchfile}`,
    {
      tokenizedpayload: encodedparams,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-access-token": authtoken,
      },
    }
  )
    .then((response) => {
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export {
  LoginRequest,
  RegisterRequest,
  RefreshAuthRequest,
  VerificationRequest,
  AddDeviceRequest,
  GetDevicesRequest,
  GetDeviceInfoRequest,
  GetDeviceFilesRequest,
  GetFetchFileRequest,
};

