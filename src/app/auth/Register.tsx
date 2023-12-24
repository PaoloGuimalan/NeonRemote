// import React from 'react'

import { useNavigate } from "react-router-dom"

function Register() {

  const navigate = useNavigate()

  return (
    <div className="bg-[#fafafa] w-full h-full flex flex-col justify-center items-center font-Inter">
      <div className="bg-transparent w-[95%] max-w-[500px] flex flex-col gap-[30px]">
        <span className="font-bold text-[35px]">Neon Remote</span>
        <div className="flex flex-col w-full max-w-[400px] items-start self-center">
          <span className="mb-[20px] border-b-[2px] border-[#000000] pb-[5px] text-[15px] font-semibold">Create an account</span>
          <hr className="w-full max-w-[400px] border-[1px] border-[#e8eaed]"/>
        </div>
        <div className="flex flex-col gap-[10px] items-center">
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" placeholder="First Name" id="firstname" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" placeholder="Last Name" id="lastname" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" placeholder="Email" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="password" placeholder="Password" className="flex flex-1 pl-[15px]  pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px] pt-[20px]">
            <button className="flex flex-row justify-center items-center gap-1 bg-black border-[2px] border-[#000000] w-full h-[40px] rounded-[5px] text-center text-white text-[15px] font-semibold">Confirm</button>
          </div>
          <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px] pt-[20px] justify-center">
            <span className="text-[14px] -mt-[1px]">Already have an account?</span>
            <a onClick={() => { navigate("/login") }} className="text-[14px] -mt-[1px] cursor-pointer border-b-[1px] border-[#000000]">Login here.</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register