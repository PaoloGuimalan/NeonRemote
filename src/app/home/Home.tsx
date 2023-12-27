import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import SampleIcon from '../../assets/SampleIcon.svg'
import { FiUser } from 'react-icons/fi'
import { MdDevicesOther, MdOutlineSettings } from 'react-icons/md'
import { BiMapAlt } from "react-icons/bi";
import { FiHome } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { SET_AUTHENTICATION } from '@/redux/types'
import { authenticationstate } from '@/redux/actions/states'
import { CloseSSENotifications, SSENotificationsTRequest } from '@/hooks/sseclient'
import { AuthStateInterface } from '@/hooks/interfaces'
import Feed from '../subcomponents/Feed'
import Devices from '../subcomponents/Devices'
import Settings from '../subcomponents/Settings'
import Map from '../subcomponents/Map'

function Home() {

  const [toggleusercontrols, settoggleusercontrols] = useState(false);

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const initProcesses = () => {
    // Initial API Requests
    SSENotificationsTRequest(authentication ,dispatch);
  }

  useEffect(() => {
    initProcesses()
  },[])

  const logoutProcess = () => {
    CloseSSENotifications();
    localStorage.removeItem("authtoken")
    dispatch({
      type: SET_AUTHENTICATION,
      payload:{
        authentication:{
          auth: false,
          user: authenticationstate.user
        }
      }
    })
  }

  return (
    <div className="bg-transparent w-full h-full flex flex-col">
      <div className="w-full h-[65px] bg-white flex flex-row items-center pl-[20px] pr-[20px] border-b-[1px] border-[#e5e6ea] font-Inter">
        {/* <img src={SampleIcon} onClick={() => { navigate("/") }} className='w-full h-full max-w-[120px] max-h-[50px] cursor-pointer' /> */}
        <img src={SampleIcon} onClick={() => { navigate("/") }} className='w-full h-full max-w-[70px] max-h-[30px] cursor-pointer object-cover' />
        <div className='flex flex-1' />
        <button
        onClick={() => {
          settoggleusercontrols(!toggleusercontrols)
        }}
        className='bg-[#e3e7f1] flex justify-center items-center w-[40px] h-[40px] rounded-[40px]'>
            <FiUser style={{fontSize: "22px", color: "#21242c"}} />
        </button>
        <motion.div
          initial={{
            overflowY: "hidden",
            height: "0px",
            paddingTop: "0px",
            paddingBottom: "0px",
            borderWidth: "0px"
          }}
          animate={{
            height: toggleusercontrols? "auto" : "0px",
            paddingTop: toggleusercontrols? "5px" : "0px",
            paddingBottom: toggleusercontrols? "5px" : "0px",
            borderWidth: toggleusercontrols? "1px" : "0px"
          }}
        className='flex flex-col pl-[5px] pr-[5px] p-[5px] bg-white absolute right-[20px] top-[55px] w-full max-w-[150px] rounded-[7px] border-[1px] border-[#e5e6ea]'>
          <motion.button
          onClick={() => {
            logoutProcess()
          }}
          whileHover={{
            backgroundColor: "#dd524c",
            color: "white"
          }}
          className='h-[30px] text-[14px] rounded-[5px] text-red-500 font-semibold'>Logout</motion.button>
        </motion.div> 
      </div>
      <div className='bg-transparent flex flex-1 flex-row font-Inter'>
        <div className='bg-transparent flex h-[100%-50px] flex-col w-[calc(100%-40px)] max-w-[270px] items-start p-[20px] pt-[25px] border-r-[0px] border-[#e5e6ea] gap-[2px] overflow-y-auto x-scroll'>
            <motion.button
            whileHover={{
              backgroundColor: "#f3f5f9"
            }}
            onClick={() => {
              navigate("/")
            }} 
            className='bg-transparent p-[10px] rounded-[7px] pt-[10px] pb-[10px] w-full max-w-[200px] flex flex-row justify-start items-center text-[14px] font-semibold gap-2'>
              <FiHome style={{fontSize: "20px", color: "#000000"}} />
              <span className='text-[#000000]'>Home</span>
            </motion.button>
            <motion.button
            whileHover={{
              backgroundColor: "#f3f5f9"
            }} 
            onClick={() => {
              navigate("/map")
            }} 
            className='bg-transparent p-[10px] rounded-[7px] pt-[10px] pb-[10px] w-full max-w-[200px] flex flex-row justify-start items-center text-[14px] font-semibold gap-2'>
              <BiMapAlt style={{fontSize: "22px", color: "#000000"}} />
              <span className='text-[#000000]'>Map</span>
            </motion.button>
            <motion.button
            whileHover={{
              backgroundColor: "#f3f5f9"
            }} 
            onClick={() => {
              navigate("/devices")
            }} 
            className='bg-transparent p-[10px] rounded-[7px] pt-[10px] pb-[10px] w-full max-w-[200px] flex flex-row justify-start items-center text-[14px] font-semibold gap-2'>
              <MdDevicesOther style={{fontSize: "22px", color: "#000000"}} />
              <span className='text-[#000000]'>Devices</span>
            </motion.button>
            <motion.button
            whileHover={{
              backgroundColor: "#f3f5f9"
            }} 
            onClick={() => {
              navigate("/settings")
            }} 
            className='bg-transparent p-[10px] rounded-[7px] pt-[10px] pb-[10px] w-full max-w-[200px] flex flex-row justify-start items-center text-[14px] font-semibold gap-2'>
              <MdOutlineSettings style={{fontSize: "22px", color: "#000000"}} />
              <span className='text-[#000000]'>Settings</span>
            </motion.button>
        </div>
        <div className='flex flex-col flex-1 h-[calc(100vh-65px)] overflow-y-auto x-scroll'> {/**bg-[#f7f7f7]  */} 
          <Routes>
            <Route path='/' element={<Feed />} />
            <Route path='/map/*' element={<Map />} />
            <Route path='/devices/*' element={<Devices />} />
            <Route path='/settings/*' element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Home