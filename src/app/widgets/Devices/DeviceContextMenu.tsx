/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDeviceContextMenu } from "@/hooks/props";
import { motion } from "framer-motion";

function DeviceContextMenu({
  contextMenu,
  handleContextMenuClick,
}: PDeviceContextMenu) {
  return (
    <motion.div
      initial={{
        top: contextMenu.clientY,
        left: contextMenu.clientX,
        scale: contextMenu.toggled ? 1 : 0,
      }}
      animate={{
        top: contextMenu.clientY,
        left: contextMenu.clientX,
        scale: contextMenu.toggled ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
      }}
      className="bg-black absolute opacity-[0.8] p-[10px] text-white min-w-[150px] rounded-[4px] flex flex-col items-center overflow-y-hidden"
    >
      <div className="w-full flex flex-row justify-start">
        <span className="text-[12px] font-semibold pt-[2px] pb-[2px]">
          {contextMenu.target !== "none" ? contextMenu.data?.filename : "Menu"}
        </span>
      </div>
      <hr className="border-gray-500 border-[1px] w-full mt-[5px] mb-[5px]" />
      {contextMenu.target === "file" && (
        <div className="w-full flex flex-col items-start">
          <button
            onClick={() => {
              handleContextMenuClick(
                "fetch",
                contextMenu.target,
                contextMenu.data
              );
            }}
            className="w-full text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px] hover:bg-[#888888]"
          >
            Fetch
          </button>
          <button className="w-full text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px] hover:bg-[#888888]">
            Transfer
          </button>
          <button className="w-full text-red-500 hover:bg-red-500 hover:text-white text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px]">
            Delete
          </button>
        </div>
      )}
      {contextMenu.target === "folder" && (
        <div className="w-full flex flex-col items-start">
          <button
            onClick={() => {
              handleContextMenuClick(
                "goto",
                contextMenu.target,
                contextMenu.data
              );
            }}
            className="w-full text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px] hover:bg-[#888888]"
          >
            Go to {contextMenu.data?.filename}
          </button>
          <button className="w-full text-red-500 hover:bg-red-500 hover:text-white text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px] hover:bg-[#888888]">
            Delete folder
          </button>
        </div>
      )}
      {contextMenu.target === "none" && (
        <div className="w-full flex flex-col items-start">
          <button
            onClick={() => {
              handleContextMenuClick(
                "reload",
                contextMenu.target,
                contextMenu.data
              );
            }}
            className="w-full text-left px-[4px] rounded-[3px] text-[12px] font-normal pt-[2px] pb-[2px] hover:bg-[#888888]"
          >
            Reload
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default DeviceContextMenu;

