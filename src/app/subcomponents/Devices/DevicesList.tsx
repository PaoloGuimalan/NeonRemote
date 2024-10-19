/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IoMdAdd } from "react-icons/io";
import DialogWidget from "../../widgets/AddDeviceWidgets/DialogWidget";
import { TbDevicesOff } from "react-icons/tb";
import { RiComputerLine } from "react-icons/ri";
import { RxMobile } from "react-icons/rx";
import { PiCircuitry } from "react-icons/pi";
import { useSelector } from "react-redux";
import { GetDevicesRequest } from "@/hooks/requests";
import { useToast } from "@/components/ui/use-toast";
import { AuthStateInterface } from "@/hooks/interfaces";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DevicesList() {
  const counteronsseopen: number = useSelector(
    (state: any) => state.counteronsseopen
  );
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication
  );
  const devicelist: any[] = useSelector((state: any) => state.devicelist);

  const navigate = useNavigate();
  const { toast } = useToast();

  const GetDevicesProcess = () => {
    GetDevicesRequest({
      token: authentication.user.token,
    })
      .then((response) => {
        if (!response.data.status) {
          toast({
            title: response.data.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err.message,
        });
      });
  };

  useEffect(() => {
    GetDevicesProcess();
  }, [authentication, counteronsseopen]);

  const devicelisticons: any = {
    pc: <RiComputerLine style={{ fontSize: "27px", color: "#000000" }} />,
    mobile: <RxMobile style={{ fontSize: "27px", color: "#000000" }} />,
    embedded: <PiCircuitry style={{ fontSize: "27px", color: "#000000" }} />,
  };

  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[20px]">
      <div className="w-full flex flex-row sticky top-0">
        <div className="flex flex-row gap-[20px] items-center">
          <span className="text-[20px] font-semibold">Devices</span>
          <DialogWidget
            buttonlabel="Add a device"
            icon={<IoMdAdd style={{ fontSize: "15px", color: "#ffffff" }} />}
          />
        </div>
      </div>
      {devicelist.length > 0 ? (
        <div className="w-full flex flex-row flex-wrap gap-[10px] justify-center lg:justify-start">
          {devicelist.map((mp: any, i: number) => {
            return (
              <div
                key={i}
                onClick={() => {
                  navigate(`/devices/${mp.deviceID.split("_")[1]}`);
                }}
                className="flex flex-col border-[2px] rounded-[7px] border-[#e5e6ea] p-[20px] w-full max-w-[250px] h-[170px] max-h-[170px] cursor-pointer select-none"
              >
                <div className="w-full bg-transparent flex flex-row gap-[10px] items-center">
                  {devicelisticons[mp.type]}
                  <span className="text-[14px] font-semibold flex flex-1">
                    {mp.deviceName}
                  </span>
                  <div className="w-[10px] h-[10px] bg-[#b3b3b3] rounded-[12px]" />
                </div>
                <div className="w-full bg-transparent flex flex-row flex-1 gap-[10px] items-end justify-center">
                  <div
                    className={`${
                      mp.isActivated ? "bg-green-500" : "bg-[#b3b3b3]"
                    } p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}
                  >
                    {mp.isActivated ? "Activated" : "Not Activated"}
                  </div>
                  <div
                    className={`${
                      mp.isMounted ? "bg-green-500" : "bg-[#b3b3b3]"
                    } p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}
                  >
                    {mp.isMounted ? "Mounted" : "Not Mounted"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-full flex justify-center rounded-[10px]">
          <div className="flex flex-col items-center gap-[12px] mt-[15%] w-fit h-fit">
            <TbDevicesOff style={{ fontSize: "100px", color: "#4d4d4d" }} />
            <span className="text-[14px] font-semibold text-[#4d4d4d]">
              No Devices listed yet
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevicesList;

