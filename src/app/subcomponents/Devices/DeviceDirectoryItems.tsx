/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FetchedDeviceDataInterface,
  OnGoingFileTransferItem,
} from "@/hooks/interfaces";
import { PDeviceDirectoryItems } from "@/hooks/props";
import { useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiFileOn, CiFolderOn } from "react-icons/ci";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function DeviceDirectoryItems({
  mp,
  GetFilesListProcess,
  setcontextMenu,
}: PDeviceDirectoryItems) {
  const deviceinfo: FetchedDeviceDataInterface = useSelector(
    (state: any) => state.deviceinfo
  );

  const ongoingfiletransfer: OnGoingFileTransferItem[] = useSelector(
    (state: any) => state.ongoingfiletransfer
  );

  const diricons: any = {
    file: <CiFileOn style={{ fontSize: "30px", color: "#000000" }} />,
    folder: <CiFolderOn style={{ fontSize: "30px", color: "#000000" }} />,
    loading: (
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      >
        <AiOutlineLoading3Quarters
          style={{ fontSize: "25px", color: "#000000" }}
        />
      </motion.div>
    ),
  };

  const ongoingcurrentfiletransfer = useMemo(
    () =>
      ongoingfiletransfer.filter(
        (flt: OnGoingFileTransferItem) =>
          flt.deviceID === deviceinfo.deviceID &&
          flt.file.path === mp.path &&
          flt.file.filename === mp.filename
      ),
    [ongoingfiletransfer, deviceinfo, mp]
  );

  return (
    <div
      onClick={() => {
        if (deviceinfo.os === "windows") {
          if (mp.type === "folder") {
            GetFilesListProcess(`${mp.path}`);
          }
        } else if (deviceinfo.os === "linux") {
          if (mp.type === "folder") {
            GetFilesListProcess(`${mp.path.replaceAll("\\", "/")}`);
          }
        }
      }}
      title={mp.filename}
      onContextMenu={(e: any) => {
        e.preventDefault();
        setTimeout(() => {
          setcontextMenu((prev) => ({
            ...prev,
            data: mp,
            target: mp.type,
          }));
        }, 50);
      }}
      className={`bg-transparent hover:bg-[#b3b3b3] rounded-[5px] cursor-pointer p-[10px] w-full max-w-[100px] h-[80px] max-h-[100px] flex flex-col gap-[10px] items-center justify-end`}
    >
      {ongoingfiletransfer.length !== 0 &&
      ongoingcurrentfiletransfer.length !== 0
        ? diricons["loading"]
        : diricons[mp.type]}
      <span className="w-full text-ellipsis truncate overflow-hidden text-[12px]">
        {mp.filename}{" "}
      </span>
    </div>
  );
}

export default DeviceDirectoryItems;
