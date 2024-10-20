/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FetchedDeviceDataInterface,
  OnGoingFileTransferItem,
} from "@/hooks/interfaces";
import { PDeviceDirectoryItems } from "@/hooks/props";
import { useMemo } from "react";
import { AiOutlineDownload, AiOutlineLoading3Quarters } from "react-icons/ai";
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

  const buildAndDownloadBlob = () => {
    const chunkPromises = ongoingcurrentfiletransfer[0].file.parts.map(
      (part) => {
        return part.chunk;
      }
    );

    Promise.all(chunkPromises).then((chunks) => {
      // combine chunks into a single blob
      const blob = new Blob(chunks, {
        // Optional: specify the MIME Type of your file here
        type: ongoingcurrentfiletransfer[0].file.mimeType,
      });

      // download the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ongoingcurrentfiletransfer[0].file.filename;
      a.click();
    });
  };

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
    download: (
      <div onClick={buildAndDownloadBlob}>
        <AiOutlineDownload style={{ fontSize: "32px", color: "#000000" }} />
      </div>
    ),
  };

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
        if (ongoingcurrentfiletransfer.length === 0) {
          setTimeout(() => {
            setcontextMenu((prev) => ({
              ...prev,
              data: mp,
              target: mp.type,
            }));
          }, 50);
        }
      }}
      className={`bg-transparent hover:bg-[#b3b3b3] rounded-[5px] cursor-pointer p-[10px] w-full max-w-[100px] h-[100px] max-h-[120px] flex flex-col gap-[10px] items-center justify-end`}
    >
      {ongoingfiletransfer.length !== 0 &&
      ongoingcurrentfiletransfer.length !== 0
        ? (ongoingcurrentfiletransfer[0].file.parts.length /
            ongoingcurrentfiletransfer[0].file.totalChunks) *
            100 ===
          100
          ? diricons["download"]
          : diricons["loading"]
        : diricons[mp.type]}
      {ongoingfiletransfer.length !== 0 &&
        ongoingcurrentfiletransfer.length !== 0 && (
          <div className="w-full bg-gray-300 flex flex-row min-h-[10px] rounded-[4px]">
            <motion.div
              className="h-full rounded-[4px] bg-green-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${
                  (ongoingcurrentfiletransfer[0].file.parts.length /
                    ongoingcurrentfiletransfer[0].file.totalChunks) *
                  100
                }%`,
              }}
            />
          </div>
        )}
      <span className="w-full text-ellipsis truncate overflow-hidden text-[12px]">
        {mp.filename}{" "}
      </span>
    </div>
  );
}

export default DeviceDirectoryItems;
