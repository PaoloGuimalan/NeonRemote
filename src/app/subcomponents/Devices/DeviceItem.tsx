/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AuthStateInterface,
  FetchedDeviceDataInterface,
  IDeviceContextMenu,
  IDeviceItems,
  SystemLogsItem,
} from "@/hooks/interfaces";
import {
  GetDeviceFilesRequest,
  GetDeviceInfoRequest,
  GetFetchFileRequest,
} from "@/hooks/requests";
import { fetchedDeviceDataState } from "@/redux/actions/states";
import { SET_DEVICE_DIRECTORY, SET_DEVICE_INFO } from "@/redux/types";
import { RiComputerLine } from "react-icons/ri";
import { RxMobile } from "react-icons/rx";
import { PiCircuitry } from "react-icons/pi";
import {
  IoNotificationsOffOutline,
  IoRefresh,
  IoChevronBack,
} from "react-icons/io5";
import { CiFileOff } from "react-icons/ci";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  deviceMobileOSLabels,
  deviceOSLabels,
  deviceTypeLabels,
} from "@/hooks/properties";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import DeviceContextMenu from "@/app/widgets/Devices/DeviceContextMenu";
import { contextMenuState } from "@/hooks/states";
import DeviceDirectoryItems from "./DeviceDirectoryItems";

function DeviceItem() {
  const deviceData = useParams();

  const counteronsseopen: number = useSelector(
    (state: any) => state.counteronsseopen
  );
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication
  );
  const deviceinfo: FetchedDeviceDataInterface = useSelector(
    (state: any) => state.deviceinfo
  );
  const systemlogs: SystemLogsItem[] = useSelector(
    (state: any) => state.systemlogs
  );

  const [currentworkshoptab, setcurrentworkshoptab] =
    useState<string>("command_prompt");

  const [contextMenu, setcontextMenu] =
    useState<IDeviceContextMenu>(contextMenuState);

  const { toast } = useToast();
  const dispatch = useDispatch();

  const GetDeviceInfoProcess = () => {
    GetDeviceInfoRequest({
      deviceID: `DVC_${deviceData.deviceID}`,
      token: authentication.user.token,
    })
      .then((response) => {
        if (response.data.status) {
          // check if response successfull
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const setdirectorypath = (newpath: string) => {
    dispatch({
      type: SET_DEVICE_DIRECTORY,
      payload: {
        directorypath: newpath,
      },
    });
  };

  const GetFilesListProcess = (newpath: string | null) => {
    GetDeviceFilesRequest({
      token: authentication.user.token,
      idwithdir: {
        deviceID: `DVC_${deviceData.deviceID}`,
        path: newpath ? newpath : deviceinfo.files.directory,
      },
    })
      .then((response: any) => {
        if (!response.data.status) {
          // toast the error
          toast({
            title: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const GoBackDirectory = (oldpath: string | null) => {
    if (deviceinfo.os === "windows") {
      if (oldpath) {
        const protopatharray = [...oldpath.split("\\")];
        if (protopatharray[protopatharray.length - 1] !== "") {
          protopatharray.push("\\");
          if (protopatharray.length > 2) {
            protopatharray.splice(-2, 1);
            protopatharray.splice(-1);
            const finalpath = protopatharray.join("\\");
            if (finalpath.includes("\\")) {
              GetFilesListProcess(encodeURIComponent(finalpath));
            } else {
              GetFilesListProcess(encodeURIComponent(`${finalpath}\\`));
            }
          } else {
            GetFilesListProcess(encodeURIComponent(protopatharray.join("\\")));
          }
        } else {
          if (protopatharray.length > 2) {
            protopatharray.splice(-2, 1);
            GetFilesListProcess(encodeURIComponent(protopatharray.join("\\")));
          } else {
            GetFilesListProcess(encodeURIComponent(protopatharray.join("\\")));
          }
        }
      }
    } else if (deviceinfo.os === "linux") {
      if (oldpath) {
        const protopatharray = [...oldpath.split("/")];
        if (protopatharray[protopatharray.length - 1] !== "") {
          protopatharray.push("/");
          if (protopatharray.length > 2) {
            protopatharray.splice(-2, 1);
            protopatharray.splice(-1);
            const finalpath = protopatharray.join("/");
            if (finalpath.includes("/")) {
              GetFilesListProcess(encodeURIComponent(finalpath));
            } else {
              GetFilesListProcess(encodeURIComponent(`${finalpath}/`));
            }
          } else {
            GetFilesListProcess(encodeURIComponent(protopatharray.join("/")));
          }
        } else {
          if (protopatharray.length > 2) {
            protopatharray.splice(-2, 1);
            GetFilesListProcess(encodeURIComponent(protopatharray.join("/")));
          } else {
            GetFilesListProcess(encodeURIComponent(protopatharray.join("/")));
          }
        }
      }
    }
  };

  useEffect(() => {
    GetDeviceInfoProcess();

    if (deviceinfo.os === "linux") {
      GetFilesListProcess("/");
    } else if (deviceinfo.os === "windows") {
      GetFilesListProcess("C:\\");
    }
  }, [counteronsseopen, authentication, deviceinfo.os]);

  useEffect(() => {
    return () => {
      dispatch({
        type: SET_DEVICE_INFO,
        payload: {
          deviceinfo: fetchedDeviceDataState,
        },
      });
    };
  }, []);

  const devicelisticons: any = {
    pc: <RiComputerLine style={{ fontSize: "27px", color: "#000000" }} />,
    mobile: <RxMobile style={{ fontSize: "27px", color: "#000000" }} />,
    embedded: <PiCircuitry style={{ fontSize: "27px", color: "#000000" }} />,
  };

  const download = (data: string, filename: string, type: string) => {
    const file = new Blob([data], { type: type });
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  const GetFetchFileRequestProcess = () => {
    GetFetchFileRequest({
      token: authentication.user.token,
      handshake: {
        deviceID: deviceinfo.deviceID,
        path:
          deviceinfo.os === "linux"
            ? contextMenu.data?.path.replace("\\", "/")
            : contextMenu.data?.path,
        filename: contextMenu.data?.filename,
      },
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleContextMenuClick = (
    action: string,
    target: string,
    data: IDeviceItems | null
  ) => {
    if (target === "none") {
      if (action === "reload") {
        GetFilesListProcess(deviceinfo.files.directory);
      }
    }

    if (target === "file") {
      // pending features
      if (action === "fetch") {
        GetFetchFileRequestProcess();
      }
    }

    if (target === "folder") {
      if (action === "goto") {
        if (data) {
          if (deviceinfo.os === "windows") {
            GetFilesListProcess(`${data.path}`);
          } else if (deviceinfo.os === "linux") {
            GetFilesListProcess(`${data.path.replaceAll("\\", "/")}`);
          }
        }
      }
    }

    setcontextMenu((prev) => ({
      ...prev,
      toggled: false,
      target: "none",
      data: null,
    }));
  };

  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[20px]">
      <div className="w-full flex flex-row">
        <div className="flex flex-row gap-[10px] items-center">
          {devicelisticons[deviceinfo.type]}
          <span className="text-[20px] font-semibold mt-[1px]">
            {deviceinfo.deviceName}
          </span>
        </div>
      </div>
      <div className="bg-transparent w-full flex flex-row flex-wrap gap-[10px]">
        <div className="w-full max-w-[300px] flex flex-col gap-[10px]">
          <div className="w-full max-h-[280px] bg-black text-white rounded-[5px] p-[20px] flex flex-col items-start gap-[2px]">
            <div className="w-full flex flex-col items-start gap-[4px]">
              <span className="font-semibold text-[16px]">
                {deviceinfo.deviceID}
              </span>
              <span className="font-semibold text-[16px]">
                {authentication.user.userID}
              </span>
            </div>
            <div className="w-full flex flex-col items-start gap-[0px]">
              <div className="w-full flex flex-row gap-[10px]">
                <span className="text-[14px]">
                  {deviceTypeLabels[deviceinfo.type]}
                </span>
              </div>
              <div className="w-full flex flex-row gap-[10px]">
                <span className="text-[14px]">
                  {deviceinfo.type !== "embedded"
                    ? deviceinfo.type === "pc"
                      ? deviceOSLabels[deviceinfo.os]
                      : deviceMobileOSLabels[deviceinfo.os]
                    : ""}
                </span>
              </div>
              <div className="w-full flex flex-row gap-[5px] mt-[20px]">
                <div className="bg-transparent flex flex-1">
                  <input
                    disabled
                    defaultValue={deviceinfo.connectionToken}
                    className="text-[14px] h-[35px] rounded-[5px] bg-black border-[2px] border-white text-[#b3b3b3] select-none w-full pl-[10px] pr-[10px]"
                  />
                </div>
                <Button
                  className="h-[35px] text-[12px] bg-white text-black hover:bg-[#f7f7f7] font-semibold"
                  onClick={() => {
                    navigator.clipboard.writeText(deviceinfo.connectionToken);
                    toast({
                      title: "Connection token has been copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="w-full flex flex-row gap-[5px] mt-[10px]">
                <Button
                  className="h-[35px] text-[12px] w-full bg-white text-black hover:bg-[#f7f7f7] font-semibold rounded-[4px]"
                  onClick={() => {
                    download(
                      `${authentication.user.userID};${deviceinfo.deviceID};${deviceinfo.connectionToken}`,
                      `${deviceinfo.deviceName}.nsrv`,
                      "nsrv"
                    );
                  }}
                >
                  Download .nsrv file
                </Button>
              </div>
            </div>
            <div className="w-full flex flex-row gap-[5px] mt-[5px]">
              <div
                className={`${
                  deviceinfo.isActivated ? "bg-green-500" : "bg-[#b3b3b3]"
                } p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}
              >
                {deviceinfo.isActivated ? "Activated" : "Not Activated"}
              </div>
              <div
                className={`${
                  deviceinfo.isMounted ? "bg-green-500" : "bg-[#b3b3b3]"
                } p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}
              >
                {deviceinfo.isMounted ? "Mounted" : "Not Mounted"}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-start mt-[10px] gap-[5px]">
            <span className="text-[16px] font-semibold">Notifications</span>
            {deviceinfo.notifications.length > 0 ? (
              <div className="w-full h-[310px] bg-transparent overflow-y-scroll x-scroll">
                {/* notifications list */}
              </div>
            ) : (
              <div className="w-full h-[310px] bg-transparent justify-center">
                <div className="flex flex-col items-center gap-[10px] mt-[20%]">
                  <IoNotificationsOffOutline
                    style={{ fontSize: "35px", color: "#4d4d4d" }}
                  />
                  <span className="text-[13px] text-[#4d4d4d]">
                    No notifications yet
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 bg-transparent gap-[20px]">
          <div className="flex flex-0 gap-[10px] flex-col items-start h-[600px] bg-[#e6e6e6] rounded-[5px] p-[20px]">
            <div className="w-full flex items-start gap-[5px]">
              <Button
                onClick={() => {
                  GoBackDirectory(
                    decodeURIComponent(deviceinfo.files.directory)
                  );
                }}
                className="h-[35px] bg-white text-black hover:bg-[#f7f7f7] items-center justify-center"
              >
                <IoChevronBack style={{ fontSize: "20px", color: "#4d4d4d" }} />
              </Button>
              <Button
                onClick={() => {
                  GetFilesListProcess(deviceinfo.files.directory);
                }}
                className="h-[35px] bg-white text-black hover:bg-[#f7f7f7] items-center justify-center"
              >
                <IoRefresh style={{ fontSize: "20px", color: "#4d4d4d" }} />
              </Button>
              <input
                disabled={false}
                placeholder="No Directory"
                value={decodeURIComponent(deviceinfo.files.directory)}
                onChange={(e) => {
                  setdirectorypath(encodeURIComponent(e.target.value));
                }}
                defaultValue={decodeURIComponent(deviceinfo.files.directory)}
                className="text-[#333333] font-semibold text-[14px] h-[35px] rounded-[5px] bg-white border-[2px] border-white select-none w-full pl-[10px] pr-[10px]"
              />
            </div>
            {deviceinfo.files.list.length > 0 ? (
              <div className="w-full bg-white flex flex-row flex-1 rounded-[5px] overflow-y-scroll x-scroll">
                <DeviceContextMenu
                  contextMenu={contextMenu}
                  handleContextMenuClick={handleContextMenuClick}
                />
                <div
                  className="select-none w-full h-fit flex flex-row flex-wrap gap-[10px] items-start justify-start p-[10px]"
                  onBlur={() => {
                    setcontextMenu({
                      clientX: 0,
                      clientY: 0,
                      toggled: false,
                      target: "none",
                      data: null,
                    });
                  }}
                  onContextMenu={(e: any) => {
                    e.preventDefault();
                    setcontextMenu((prev) => ({
                      ...prev,
                      toggled: false,
                      data: null,
                      target: "none",
                    }));
                    setTimeout(() => {
                      setcontextMenu((prev) => ({
                        ...prev,
                        clientX: e.clientX,
                        clientY: e.clientY,
                      }));
                    }, 100);
                    setTimeout(() => {
                      setcontextMenu((prev) => ({
                        ...prev,
                        toggled: true,
                      }));
                    }, 200);
                  }}
                >
                  {deviceinfo.files.list.map((mp: IDeviceItems, i: number) => {
                    return (
                      <DeviceDirectoryItems
                        key={i}
                        mp={mp}
                        GetFilesListProcess={GetFilesListProcess}
                        setcontextMenu={setcontextMenu}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full bg-white flex flex-col flex-wrap flex-1 rounded-[5px] items-center justify-center">
                <div className="flex flex-col items-center gap-[10px]">
                  <CiFileOff style={{ fontSize: "35px", color: "#4d4d4d" }} />
                  <span className="text-[13px] text-[#4d4d4d]">No files</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-0 gap-[0px] flex-col items-start h-[600px] bg-[#e6e6e6] rounded-[5px] p-[20px]">
            <div className="w-full flex flex-row overflow-x-auto">
              <motion.button
                initial={{
                  backgroundColor:
                    currentworkshoptab === "command_prompt"
                      ? "black"
                      : "#3e3e3e",
                  color:
                    currentworkshoptab === "command_prompt"
                      ? "white"
                      : "#d9d9d9",
                }}
                animate={{
                  backgroundColor:
                    currentworkshoptab === "command_prompt"
                      ? "black"
                      : "#3e3e3e",
                  color:
                    currentworkshoptab === "command_prompt"
                      ? "white"
                      : "#d9d9d9",
                }}
                onClick={() => {
                  setcurrentworkshoptab("command_prompt");
                }}
                className="select-none w-full flex items-start gap-[5px] max-w-[180px] p-[10px] border-[1px] border-t-[0px] border-[#4d4d4d] items-center justify-center rounded-[7px] rounded-b-[0px]"
              >
                <span className="text-[14px] font-semibold">
                  Command Prompt
                </span>
              </motion.button>
              <motion.button
                initial={{
                  backgroundColor:
                    currentworkshoptab === "system_logs" ? "black" : "#3e3e3e",
                  color:
                    currentworkshoptab === "system_logs" ? "white" : "#d9d9d9",
                }}
                animate={{
                  backgroundColor:
                    currentworkshoptab === "system_logs" ? "black" : "#3e3e3e",
                  color:
                    currentworkshoptab === "system_logs" ? "white" : "#d9d9d9",
                }}
                onClick={() => {
                  setcurrentworkshoptab("system_logs");
                }}
                className="select-none w-full flex items-start gap-[5px] max-w-[180px] p-[10px] border-[1px] border-t-[0px] border-[#4d4d4d] items-center justify-center rounded-[7px] rounded-b-[0px]"
              >
                <span className="text-[14px] font-semibold">System Logs</span>
              </motion.button>
            </div>
            {currentworkshoptab === "command_prompt" && (
              <div className="w-full flex flex-row flex-1 rounded-[5px] rounded-tl-[0px] overflow-y-scroll x-scroll bg-black">
                <div className="w-full h-fit flex flex-col flex-wrap gap-[20px] items-start justify-start p-[20px]">
                  <div className="flex flex-col items-start bg-transparent">
                    <span className="text-white text-[14px] font-semibold">
                      Neon Remote{" "}
                      <sup className="font-normal">powered by Neon Service</sup>
                    </span>
                    <span className="text-white text-[12px]">
                      Accessing device{" "}
                      <span className="font-semibold">
                        {deviceinfo.deviceName} @{" "}
                        {decodeURIComponent(deviceinfo.files.directory)}
                      </span>
                    </span>
                  </div>
                  <div className="bg-transparent w-full flex flex-col items-start gap-[5px] justify-center">
                    <div className="flex flex-row gap-[10px] w-full items-start">
                      <span className="text-[14px] text-white flex justify-center items-center font-semibold">
                        {deviceinfo.deviceName} &gt;
                      </span>
                      <p
                        contentEditable
                        className="text-white text-[14px] flex flex-wrap flex-1 text-left text-wrap break-all mt-[1px] outline-none"
                      ></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentworkshoptab === "system_logs" && (
              <div className="w-full flex flex-row flex-1 rounded-[5px] rounded-tl-[0px] overflow-y-scroll x-scroll bg-black">
                <div className="w-full h-fit flex flex-col flex-wrap gap-[5px] items-start justify-start p-[20px] pt-[0px]">
                  <div className="w-full sticky top-0 pt-[20px] bg-black">
                    <div className="flex flex-row items-start bg-white w-full gap-[5px]">
                      <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                        <span className="text-black text-[14px] font-semibold">
                          Time
                        </span>
                      </div>
                      <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                        <span className="text-black text-[14px] font-semibold">
                          Status
                        </span>
                      </div>
                      <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                        <span className="text-black text-[14px] font-semibold">
                          Request
                        </span>
                      </div>
                      <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                        <span className="text-black text-[14px] font-semibold">
                          Host
                        </span>
                      </div>
                      <div className="p-[10px] flex flex-1 justify-center">
                        <span className="text-black text-[14px] font-semibold">
                          Data
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-transparent w-full flex flex-col items-start gap-[2px] justify-center">
                    {systemlogs
                      .filter(
                        (flt: SystemLogsItem) =>
                          flt.deviceID === deviceinfo.deviceID
                      )
                      .map((item: SystemLogsItem, i: number) => {
                        return (
                          <div
                            key={i}
                            className="flex flex-row items-start bg-[#262626] w-full gap-[5px]"
                          >
                            <div className="p-[10px] flex flex-1 max-w-[170px]">
                              <span className="text-white text-[12px]">
                                {item.time}
                              </span>
                            </div>
                            <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                              <span className="text-white text-[12px]">
                                {item.status}
                              </span>
                            </div>
                            <div className="p-[10px] flex flex-1 max-w-[170px] justify-center">
                              <span className="text-white text-[12px]">
                                {item.request}
                              </span>
                            </div>
                            <div className="p-[10px] flex flex-1 max-w-[200px] h-fit break-all">
                              <span className="text-white text-[12px] text-left">
                                {item.host}
                              </span>
                            </div>
                            <div className="p-[10px] flex flex-1 flex-wrap h-fit word-break justify-center">
                              <span className="text-white text-[12px] break-all">
                                {JSON.stringify(item.data, null, 4)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceItem;
