/* eslint-disable @typescript-eslint/no-explicit-any */
import sign from "jwt-encode";
import { Dispatch } from "redux";
import { ActionProp, AuthStateInterface } from "./interfaces";
import jwt_decode from "jwt-decode";
import {
  SET_COUNTER_ON_SSE_OPEN,
  SET_DEVICE_DIRNPATH,
  SET_DEVICE_INFO,
  SET_DEVICE_LIST,
  SET_ONGOING_FILE_CHUNK,
  SET_ONGOING_FILE_TRANSFER,
  SET_SYSTEM_LOGS,
} from "@/redux/types";

const API = import.meta.env.VITE_NEON_AI_API;
const SECRET = import.meta.env.VITE_JWT_SECRET;

let sseNtfsSource: EventSource | null = null;

const SSENotificationsTRequest = (
  authentication: AuthStateInterface,
  dispatch: Dispatch<ActionProp>
) => {
  const decodetoken: any = jwt_decode(authentication.user.token);
  const mutateToken = {
    ...decodetoken,
    connectionType: "remote",
  };
  const tokenizemutatedtoken = sign(mutateToken, SECRET);

  const payload = {
    token: tokenizemutatedtoken,
    type: "notifications",
  };

  const encodedPayload = sign(payload, SECRET);

  sseNtfsSource = new EventSource(
    `${API}/access/ssehandshake/${encodedPayload}`
  );

  sseNtfsSource.onopen = () => {
    dispatch({
      type: SET_COUNTER_ON_SSE_OPEN,
      payload: "",
    });
  };

  sseNtfsSource.addEventListener("notifications", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.auth) {
      if (parsedresponse.status) {
        const decodedResult = jwt_decode(parsedresponse.result);

        //play ringtone

        //execute notification handling
        console.log(decodedResult);
      }
    }
  });

  sseNtfsSource.addEventListener("devicelist", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);

      //play ringtone

      //execute notification handling
      // console.log(decodedResult.data);
      dispatch({
        type: SET_DEVICE_LIST,
        payload: {
          devicelist: decodedResult.data,
        },
      });
    }
  });

  sseNtfsSource.addEventListener("deviceinfo", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);

      //play ringtone

      //execute notification handling
      // console.log(decodedResult.data);
      dispatch({
        type: SET_DEVICE_INFO,
        payload: {
          deviceinfo: decodedResult.data,
        },
      });
    }
  });

  sseNtfsSource.addEventListener("devicefileslist", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);
      const platform = decodedResult.data.os;

      //play ringtone

      //execute notification handling
      // console.log(decodedResult.data);

      const devicefileslistdata = [
        ...decodedResult.data.dirs.map((mp: any) => ({
          filename: decodeURIComponent(mp).split(
            platform === "linux" ? "/" : "\\"
          )[
            decodeURIComponent(mp).split(platform === "linux" ? "/" : "\\")
              .length - 1
          ],
          path: mp,
          type: "folder",
        })),
        ...decodedResult.data.files.map((mp: any) => ({
          filename: decodeURIComponent(mp).split(
            platform === "linux" ? "/" : "\\"
          )[
            decodeURIComponent(mp).split(platform === "linux" ? "/" : "\\")
              .length - 1
          ],
          path: mp,
          type: "file",
        })),
      ];

      // console.log(devicefileslistdata, decodedResult.data.path);

      dispatch({
        type: SET_DEVICE_DIRNPATH,
        payload: {
          dirnpath: {
            directory: decodedResult.data.path,
            list: devicefileslistdata,
          },
        },
      });
    }
  });

  sseNtfsSource.addEventListener("devicesystemlogs", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);

      // console.log(decodedResult.data);

      dispatch({
        type: SET_SYSTEM_LOGS,
        payload: {
          newlog: decodedResult.data,
        },
      });
    }
  });

  sseNtfsSource.addEventListener("fetch_file_metadata", (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);

      dispatch({
        type: SET_ONGOING_FILE_TRANSFER,
        payload: {
          newfiletransfer: decodedResult.data,
        },
      });
    }
  });

  function base64toBlob(base64Data: string, contentType: string) {
    contentType = contentType || "";
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  sseNtfsSource.addEventListener("fetch_file_response", async (e) => {
    const parsedresponse = JSON.parse(e.data);
    if (parsedresponse.status) {
      const decodedResult: any = jwt_decode(parsedresponse.result);

      const data = decodedResult.data.part;
      const metadata = decodedResult.data.file;
      const deviceID = decodedResult.data.deviceID;
      const blobdata = base64toBlob(data.chunk.split(",")[1], "");

      dispatch({
        type: SET_ONGOING_FILE_CHUNK,
        payload: {
          newchunk: {
            data: {
              PartNumber: data.PartNumber,
              chunk: blobdata,
            },
            metadata: {
              ...metadata,
              deviceID,
            },
          },
        },
      });
    }
  });
};

const CloseSSENotifications = () => {
  if (sseNtfsSource) {
    sseNtfsSource.close();
  }
};

export { SSENotificationsTRequest, CloseSSENotifications };
