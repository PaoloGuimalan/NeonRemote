import { Dispatch, SetStateAction } from "react";
import { IDeviceContextMenu, IDeviceItems } from "./interfaces";

export interface PDeviceContextMenu {
  contextMenu: IDeviceContextMenu;
  handleContextMenuClick: (
    action: string,
    target: string,
    data: IDeviceItems | null
  ) => void;
}

export interface PDeviceDirectoryItems {
  mp: IDeviceItems;
  GetFilesListProcess: (newpath: string | null) => void;
  setcontextMenu: Dispatch<SetStateAction<IDeviceContextMenu>>;
}
