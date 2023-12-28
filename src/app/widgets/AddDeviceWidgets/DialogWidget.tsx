import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthStateInterface, DeviceInfoInterface, DialogWidgetProp } from "@/hooks/interfaces"
import DropdownMenuWidget from "./DropdownMenuWidget"
import { useState } from "react"
import { deviceMobileOSLabels, deviceMobileOSList, deviceOSLabels, deviceOSList, deviceTypeLabels, deviceTypeList } from "@/hooks/properties"
import { AddDeviceRequest } from "@/hooks/requests"
import { useToast } from "@/components/ui/use-toast"
import { useSelector } from "react-redux"

export default function DialogWidget({ buttonlabel, icon }: DialogWidgetProp) {

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);

  const deviceInfoState: DeviceInfoInterface = {
    deviceName: "",
    deviceType: "none",
    os: "none"
  };

  const [deviceInfo, setdeviceInfo] = useState<DeviceInfoInterface>(deviceInfoState);
  const [openDialog, setopenDialog] = useState<boolean>(false);

  const { toast } = useToast();

  const setDeviceType = (newType: string) => {
    if(newType === "embedded" || newType === "none"){
      setdeviceInfo({
        ...deviceInfo,
        deviceType: newType,
        os: "none"
      })
    }
    else{
      setdeviceInfo({
        ...deviceInfo,
        deviceType: newType,
        os: "none"
      })
    }
  }

  const setOperatingSystem = (newOS: string) => {
    setdeviceInfo({
      ...deviceInfo,
      os: newOS
    })
  }

  const changeDeviceName = (newName: string) => {
    setdeviceInfo({
      ...deviceInfo,
      deviceName: newName
    })
  }

  const AddDeviceProcess = () => {
    AddDeviceRequest({
      data: deviceInfo,
      token: authentication.user.token
    }).then((response) => {
      if(response.data.status){
        setopenDialog(false);
        setdeviceInfo(deviceInfoState);
        toast({
          title: response.data.message
        })
      }
      else{
        toast({
          title: response.data.message
        })
      }
    }).catch((err) => {
      console.log(err);
      toast({
        title: err.message
      })
    })
  }

  return (
    <Dialog open={openDialog} onOpenChange={(e) => {
      setopenDialog(e);
      if(!e){
        setdeviceInfo(deviceInfoState);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-[5px] items-center justify-center">
            {icon}
            {buttonlabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a device</DialogTitle>
          <DialogDescription>
            Fill in the fields as per your device information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="name" className="text-right">
              Device Name
            </Label>
            <Input id="name" value={deviceInfo.deviceName} onChange={(e) => { changeDeviceName(e.target.value) }} placeholder="ex: My Device" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label htmlFor="type" className="text-right">
              Device Type
            </Label>
            <div id="type" className="col-span-3">
              <DropdownMenuWidget position={deviceInfo.deviceType} list={deviceTypeList} labels={deviceTypeLabels} setPosition={setDeviceType} />
            </div>
          </div>
          {deviceInfo.deviceType !== "embedded" && (
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="os" className="text-right">
                Operating System
              </Label>
              <div id="type" className="col-span-3">
                <DropdownMenuWidget position={deviceInfo.os} list={deviceInfo.deviceType === "pc" ? deviceOSList : deviceMobileOSList} labels={deviceInfo.deviceType === "pc" ? deviceOSLabels : deviceMobileOSLabels} setPosition={setOperatingSystem} />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => { AddDeviceProcess() }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
