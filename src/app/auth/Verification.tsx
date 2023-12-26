import { KeyboardEvent } from 'react';
import { checkIfValid } from '@/hooks/reusables';
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SET_AUTHENTICATION } from '@/redux/types';
import { authenticationstate } from '@/redux/actions/states';
import { useToast } from '@/components/ui/use-toast';
import { VerificationRequest } from '@/hooks/requests';
import { AuthStateInterface } from '@/hooks/interfaces';
import jwtDecode from 'jwt-decode';
import sign from 'jwt-encode';

function Verification() {

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication)

  const [verification_code, setverification_code] = useState("");

  const { toast } = useToast()
  const dispatch = useDispatch()

  const verificationProcess = () => {
    if(checkIfValid([verification_code])){
      VerificationRequest({
        userID: authentication.user.userID,
        code: verification_code
      }).then((response) => {
        if(response.data.status){
          var decodedToken: any = jwtDecode(response.data.result);
          var userdata = decodedToken;
          var authtoken = {
              ...userdata,
              token: sign({
                  email: userdata.email,
                  userID: userdata.userID
              }, response.SECRET)
          };

          toast({
            title: response.data.message
          })

          var encodedAuthToken = sign(authtoken, response.SECRET)
          localStorage.setItem("authtoken", encodedAuthToken)
          dispatch({
              type: SET_AUTHENTICATION,
              payload:{
                  authentication: {
                      auth: true,
                      user: authtoken
                  }
              }
          })
        }
        else{
          toast({
            title: response.data.message
          });
        }
      }).catch((err) => {
        toast({
          title: err.message
        });
      })
    }
    else{
      // console.log("Please complete the fields")
      toast({
        title: "Please enter a valid code"
      })
    }
  }

  const verificationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if(event.code == "Enter"){
        verificationProcess()
    }
  }

  const logoutProcess = () => {
    toast({
      title: "Logged out!"
    })
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
    <div className="bg-[#fafafa] w-full h-full flex flex-col justify-center items-center font-Inter">
      <div className="bg-transparent w-[95%] max-w-[500px] flex flex-col gap-[30px]">
        <span className="font-bold text-[35px]">Neon Remote</span>
        <div className="flex flex-col w-full max-w-[400px] items-start self-center">
          <span className="mb-[20px] border-b-[2px] border-[#000000] pb-[5px] text-[15px] font-semibold">Verification</span>
          <hr className="w-full max-w-[400px] border-[1px] border-[#e8eaed]"/>
        </div>
        <div className="flex flex-col gap-[10px] items-center">
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input value={verification_code} onChange={(e) => { setverification_code(e.target.value) }} onKeyDown={verificationKeyDown} type="text" placeholder="Verification Code" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px]">
            <button
            onClick={() => {
                verificationProcess()
            }}
            className="flex flex-row justify-center items-center gap-1 bg-black border-[2px] border-[#000000] w-full h-[40px] rounded-[5px] text-center text-white text-[15px] font-semibold">Confirm</button>
          </div>
          <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px] pt-[20px] justify-center">
            <span className="text-[14px] -mt-[1px]">Want to switch account?</span>
            <a onClick={() => { logoutProcess() }} className="text-[14px] -mt-[1px] cursor-pointer border-b-[1px] border-[#000000]">Logout.</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Verification