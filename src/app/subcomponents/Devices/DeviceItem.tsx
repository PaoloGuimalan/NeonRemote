import { AuthStateInterface, FetchedDeviceDataInterface } from '@/hooks/interfaces';
import { GetDeviceInfoRequest } from '@/hooks/requests';
import { fetchedDeviceDataState } from '@/redux/actions/states';
import { SET_DEVICE_INFO } from '@/redux/types';
import { RiComputerLine } from "react-icons/ri";
import { RxMobile } from "react-icons/rx";
import { PiCircuitry } from "react-icons/pi";
import { IoNotificationsOffOutline } from "react-icons/io5";
import { CiFileOff } from "react-icons/ci";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { deviceMobileOSLabels, deviceOSLabels, deviceTypeLabels } from '@/hooks/properties';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function DeviceItem() {

  const deviceData = useParams();

  const counteronsseopen: number = useSelector((state: any) => state.counteronsseopen);
  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const deviceinfo: FetchedDeviceDataInterface = useSelector((state: any) => state.deviceinfo);

  const { toast } = useToast();
  const dispatch = useDispatch();

  const GetDeviceInfoProcess = () => {
    GetDeviceInfoRequest({
      deviceID: `DVC_${deviceData.deviceID}`,
      token: authentication.user.token
    }).then((response) => {
      if(response.data.status){
        // check if response successfull
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  useEffect(() => {
    GetDeviceInfoProcess()
  },[counteronsseopen, authentication])

  useEffect(() => {

    return () => {
      dispatch({
        type: SET_DEVICE_INFO,
        payload: {
          deviceinfo: fetchedDeviceDataState
        }
      })
    }
  },[])

  const devicelisticons: any = {
    pc: <RiComputerLine style={{fontSize: "27px", color: "#000000"}} />,
    mobile: <RxMobile style={{fontSize: "27px", color: "#000000"}} />,
    embedded: <PiCircuitry style={{fontSize: "27px", color: "#000000"}} />,
  }

  return (
    <div className='w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center font-Inter gap-[20px]'>
        <div className="w-full flex flex-row">
            <div className="flex flex-row gap-[10px] items-center">
              {devicelisticons[deviceinfo.type]}
              <span className="text-[20px] font-semibold mt-[1px]">{deviceinfo.deviceName}</span>
            </div>
        </div>
        <div className='bg-transparent w-full flex flex-row flex-wrap gap-[10px]'>
          <div className='w-full max-w-[300px] flex flex-col gap-[10px]'>
            <div className='w-full max-h-[240px] bg-black text-white rounded-[5px] p-[20px] flex flex-col items-start gap-[10px]'>
              <div className='w-full flex flex-row gap-[10px]'>
                <span className='font-semibold text-[16px]'>{deviceinfo.deviceID}</span>
              </div>
              <div className='w-full flex flex-col items-start gap-[0px]'>
                <div className='w-full flex flex-row gap-[10px]'>
                  <span className='text-[14px]'>{deviceTypeLabels[deviceinfo.type]}</span>
                </div>
                <div className='w-full flex flex-row gap-[10px]'>
                  <span className='text-[14px]'>{deviceinfo.type !== "embedded" ? deviceinfo.type === "pc" ? deviceOSLabels[deviceinfo.os] : deviceMobileOSLabels[deviceinfo.os] : ""}</span>
                </div>
                <div className='w-full flex flex-row gap-[5px] mt-[20px]'>
                  <div className='bg-transparent flex flex-1'>
                    <input disabled defaultValue={deviceinfo.connectionToken} className='text-black text-[14px] h-[35px] rounded-[5px] bg-black border-[2px] border-white text-[#b3b3b3] select-none w-full pl-[10px] pr-[10px]' />
                  </div>
                  <Button className='h-[35px] text-[12px] bg-white text-black hover:bg-[#f7f7f7] font-semibold'
                    onClick={() => {
                      navigator.clipboard.writeText(deviceinfo.connectionToken);
                      toast({
                        title: "Connection token has been copied to clipboard"
                      })
                    }}
                  >Copy</Button>
                </div>
              </div>
              <div className='w-full flex flex-row gap-[5px] mt-[30px]'>
                <div className={`${deviceinfo.isActivated ? "bg-green-500" : "bg-[#b3b3b3]"} p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}>
                  {deviceinfo.isActivated ? "Activated" : "Not Activated"}
                </div>
                <div className={`${deviceinfo.isMounted ? "bg-green-500" : "bg-[#b3b3b3]"} p-[5px] pl-[10px] pr-[10px] text-[12px] text-white flex flex-1 justify-center rounded-[3px]`}>
                  {deviceinfo.isMounted ? "Mounted" : "Not Mounted"}
                </div>
              </div>
            </div>
            <div className='w-full flex flex-col items-start mt-[10px] gap-[5px]'>
              <span className='text-[16px] font-semibold'>Notifications</span>
              {deviceinfo.notifications.length > 0 ? (
                <div className='w-full h-[310px] bg-transparent overflow-y-scroll x-scroll'>
                    {/* notifications list */}
                </div>
              ) : (
                <div className='w-full h-[310px] bg-transparent justify-center'>
                  <div className='flex flex-col items-center gap-[10px] mt-[20%]'>
                    <IoNotificationsOffOutline style={{fontSize: "35px", color: "#4d4d4d"}} />
                    <span className='text-[13px] text-[#4d4d4d]'>No notifications yet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-1 gap-[10px] flex-col items-start h-[600px] bg-[#e6e6e6] rounded-[5px] p-[20px]'>
              <div className='w-full flex items-start'>
                <input disabled defaultValue={deviceinfo.files.directory === "" ? "No directory" : deviceinfo.files.directory} className='text-[#333333] font-semibold text-[14px] h-[35px] rounded-[5px] bg-white border-[2px] border-white select-none w-full pl-[10px] pr-[10px]' />
              </div>
              {deviceinfo.files.list.length > 0 ? (
                <div className='w-full bg-white flex flex-row flex-wrap flex-1 rounded-[5px] overflow-y-scroll x-scroll'>
                  {/* files list here */}
                </div>
              ) : (
                <div className='w-full bg-white flex flex-col flex-wrap flex-1 rounded-[5px] items-center justify-center'>
                  <div className='flex flex-col items-center gap-[10px]'>
                    <CiFileOff style={{fontSize: "35px", color: "#4d4d4d"}} />
                    <span className='text-[13px] text-[#4d4d4d]'>No files</span>
                  </div>
                </div>
              )}
          </div>
        </div>
    </div>
  )
}

export default DeviceItem