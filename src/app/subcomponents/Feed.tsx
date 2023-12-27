// import React from 'react'
import { featuredisplay } from '@/hooks/properties'
import SampleIcon from '../../assets/SampleIcon.svg'
import { MdDevicesOther } from 'react-icons/md'
import { BiMapAlt } from "react-icons/bi";
import { TiCloudStorageOutline } from "react-icons/ti";
import { CiStreamOn } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';

function Feed() {

  const navigate = useNavigate();

  const icons: any = {
    "Devices": <MdDevicesOther style={{fontSize: "80px", color: "#000000"}} />,
    "MapTracker": <BiMapAlt style={{fontSize: "80px", color: "#000000"}} />,
    "PeerStorage": <TiCloudStorageOutline style={{fontSize: "80px", color: "#000000"}} />,
    "Streaming": <CiStreamOn style={{fontSize: "80px", color: "#000000"}} />
  }
  
  return (
    <div className='w-full flex flex-col flex-1 bg-transparent overflow-y-scroll x-scroll p-[20px] items-center'>
        <div className="w-full h-[280px] bghome rounded-tl-[10px] rounded-tr-[10px] min-h-[280px]" />
        <div className="bg-transparent w-full flex flex-row flex-wrap justify-center -mt-[60px] z-[10]">
          <div className="flex flex-col flex-1 w-full lg:max-w-[400px] p-[10px] rounded-[10px]">
            <div className="w-full pt-[25px] pb-[20px] flex flex-row gap-[0px] items-center">
              <span className="font-semibold text-[25px]">Welcome to</span>
              <img src={SampleIcon} className='w-full h-full max-w-[100px] max-h-[40px] cursor-pointer object-cover' />
              {/* <span className="font-bold text-[25px]">Neon Remote</span> */}
            </div>
            <div className="w-full pb-[20px] pl-[0px] pr-[20px] pt-[10px] rounded-[10px]">
              <span className="text-[14px] flex text-justify tracking-wider"> 
                your gateway to seamless and intuitive device 
                control from anywhere in the world. At Neon Remote, 
                we redefine the way you interact with your devices by 
                providing a unified platform for remote control. 
                Whether you're managing smart home gadgets, office equipment, 
                or entertainment systems, Neon Remote offers a user-friendly 
                and versatile solution. Experience the power of connectivity 
                as you effortlessly navigate and command your devices 
                with precision and ease. Join us on the forefront of 
                innovation, where convenience meets cutting-edge technology, 
                and take control like never before with Neon Remote.
              </span>
            </div>
          </div>
          <div className="bg-transparent flex flex-col w-full lg:w-auto lg:flex-1 p-[10px]">
            <div className="w-full pt-[33px] pb-[20px] flex flex-row gap-[0px] items-center">
              <span className="font-semibold text-[20px]">Features</span>
            </div>
            <div className="w-full pb-[20px] pl-[0px] pr-[20px] pt-[10px] justify-center lg:justify-center rounded-[10px] flex flex-row flex-wrap gap-[10px]">
              {featuredisplay.map((mp: any, i: number) => {
                return(
                  <div key={i} onClick={() => { navigate(mp.route) }} className='select-none scale-[1] w-full border-[2px] rounded-[10px] border-[#e5e6ea] max-w-[270px] min-h-[170px] bg-transparent cursor-pointer flex flex-col items-center p-[10px] pt-[15px] pb-[20px] gap-[5px]'>
                    <div className='flex flex-1 items-center justify-center'>
                      {icons[mp.name.replace(/\s+/g, '')]}
                    </div>
                    <span className='text-[18px] font-semibold'>{mp.name}</span>
                    <span className='text-[14px]'>{mp.description}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
    </div>
  )
}

export default Feed