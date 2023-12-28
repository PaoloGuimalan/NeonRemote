import { IoMdAdd } from "react-icons/io";
import DialogWidget from "../widgets/AddDeviceWidgets/DialogWidget";
import { TbDevicesOff } from "react-icons/tb";
import { useSelector } from "react-redux";

function Devices() {

  const devicelist: any[] = useSelector((state: any) => state.devicelist);

  return (
    <div className='w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[15px]'>
        <div className="w-full flex flex-row sticky top-0">
            <div className="flex flex-row gap-[20px] items-center">
              <span className="text-[20px] font-semibold">Devices</span>
              <DialogWidget buttonlabel="Add a device" icon={<IoMdAdd style={{fontSize: "15px", color: "#000000"}} />} />
            </div>
        </div>
        {devicelist.length > 0 ? (
          <div className="w-full">

          </div>
        ) : (
          <div className="w-full h-full flex justify-center rounded-[10px]">
            <div className="flex flex-col items-center gap-[12px] mt-[15%] w-fit h-fit">
              <TbDevicesOff style={{fontSize: "100px", color: "#4d4d4d"}} />
              <span className="text-[14px] font-semibold text-[#4d4d4d]">No Devices listed yet</span>
            </div>
          </div>
        )}
    </div>
  )
}

export default Devices