import { AuthStateInterface, FetchedDeviceDataInterface } from '@/hooks/interfaces';
import { GetDeviceFilesRequest, GetDeviceInfoRequest } from '@/hooks/requests';
import { fetchedDeviceDataState } from '@/redux/actions/states';
import { SET_DEVICE_DIRECTORY, SET_DEVICE_INFO } from '@/redux/types';
import { RiComputerLine } from "react-icons/ri";
import { RxMobile } from "react-icons/rx";
import { PiCircuitry } from "react-icons/pi";
import { IoNotificationsOffOutline, IoRefresh, IoChevronBack } from "react-icons/io5";
import { CiFileOff, CiFileOn, CiFolderOn } from "react-icons/ci";
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

  const setdirectorypath = (newpath: string) => {
    dispatch({
      type: SET_DEVICE_DIRECTORY,
      payload: {
        directorypath: newpath
      }
    })
  }

  const GetFilesListProcess = (newpath: string | null) => {
    GetDeviceFilesRequest({
      token: authentication.user.token,
      idwithdir: {
        deviceID: `DVC_${deviceData.deviceID}`,
        path: newpath ? newpath : deviceinfo.files.directory
      }
    }).then((response: any) => {
      if(!response.data.status){
        // toast the error
        toast({
          title: response.data.message
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const GoBackDirectory = (oldpath: string | null) => {
    if(oldpath){
      var protopatharray = [...oldpath.split("\\")];
      if(protopatharray[protopatharray.length - 1] !== ''){
        protopatharray.push("\\");
        if(protopatharray.length > 2){
          protopatharray.splice(-2, 1);
          protopatharray.splice(-1)
          var finalpath = protopatharray.join("\\");
          if(finalpath.includes("\\")){
            GetFilesListProcess(finalpath);
          }
          else{
            GetFilesListProcess(`${finalpath}\\`);
          }
        }
        else{
          GetFilesListProcess(protopatharray.join("\\"));
        }
      }
      else{
        if(protopatharray.length > 2){
          protopatharray.splice(-2, 1);
          GetFilesListProcess(protopatharray.join("\\"));
        }
        else{
          GetFilesListProcess(protopatharray.join("\\"));
        }
      }
    }
  }

  useEffect(() => {
    GetDeviceInfoProcess();
    GetFilesListProcess(null);
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

  const diricons: any = {
    file: <CiFileOn style={{fontSize: "30px", color: "#000000"}} />,
    folder: <CiFolderOn style={{fontSize: "30px", color: "#000000"}} />
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
                    <input disabled defaultValue={deviceinfo.connectionToken} className='text-[14px] h-[35px] rounded-[5px] bg-black border-[2px] border-white text-[#b3b3b3] select-none w-full pl-[10px] pr-[10px]' />
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
              <div className='w-full flex items-start gap-[5px]'>
                <Button onClick={() => { GoBackDirectory(deviceinfo.files.directory) }} className='h-[35px] bg-white text-black hover:bg-[#f7f7f7] items-center justify-center'>
                  <IoChevronBack style={{fontSize: "20px", color: "#4d4d4d"}} />
                </Button>
                <Button onClick={() => { GetFilesListProcess(deviceinfo.files.directory) }} className='h-[35px] bg-white text-black hover:bg-[#f7f7f7] items-center justify-center'>
                  <IoRefresh style={{fontSize: "20px", color: "#4d4d4d"}} />
                </Button>
                <input disabled={false} placeholder='No Directory' value={decodeURIComponent(deviceinfo.files.directory)} onChange={(e) => { setdirectorypath(encodeURIComponent(e.target.value)) }} defaultValue={decodeURIComponent(deviceinfo.files.directory)} className='text-[#333333] font-semibold text-[14px] h-[35px] rounded-[5px] bg-white border-[2px] border-white select-none w-full pl-[10px] pr-[10px]' />
              </div>
              {deviceinfo.files.list.length > 0 ? (
                <div className='w-full bg-white flex flex-row flex-1 rounded-[5px] overflow-y-scroll x-scroll'>
                  <div className='select-none w-full h-fit flex flex-row flex-wrap gap-[10px] items-start justify-start p-[10px]'>
                    {deviceinfo.files.list.map((mp: any, i: number) => {
                      return(
                        <div key={i}  onClick={() => { 
                          if(mp.type === "folder"){
                            GetFilesListProcess(`${mp.path}`)
                          } 
                        }} title={mp.filename} className='bg-transparent hover:bg-[#b3b3b3] rounded-[5px] cursor-pointer p-[10px] w-full max-w-[100px] h-[80px] max-h-[100px] flex flex-col gap-[10px] items-center justify-end'>
                          {diricons[mp.type]}
                          <span className='w-full text-ellipsis truncate overflow-hidden text-[12px]'>{mp.filename}</span>
                        </div>
                      )
                    })}
                  </div>
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