import { IDeviceContextMenu, IDeviceItems } from "./interfaces";

export interface PDeviceContextMenu {
  contextMenu: IDeviceContextMenu;
  handleContextMenuClick: (
    action: string,
    target: string,
    data: IDeviceItems | null
  ) => void;
}
