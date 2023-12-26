import { useToast } from "@/components/ui/use-toast";
import { RegisterInterface } from "@/hooks/interfaces"
import { RegisterRequest } from "@/hooks/requests";
import { getDaysInMonth, monthList, years } from "@/hooks/reusables";
import { SET_AUTHENTICATION } from "@/redux/types";
import jwtDecode from "jwt-decode";
import sign from "jwt-encode";
import { useState } from "react"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"

function Register() {

  const registerDefault = {
    fullname: {
        firstName: "",
        middleName: "",
        lastName: ""
    },
    birthdate: {
        month: "",
        day: "",
        year: ""
    },
    contact: "",
    email: "",
    password: ""
  }

  const [registerData, setregisterData] = useState<RegisterInterface>(registerDefault)

  const { toast } = useToast()
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const RegisterProcess = () => {
    RegisterRequest(registerData).then((response) => {
      if(response.data.status){
        setregisterData(registerDefault);
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
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const setmonth = (newmonth: string) => {
    setregisterData({
      ...registerData,
      birthdate: {
        ...registerData.birthdate,
        month: newmonth
      }
    })
  }

  const setday = (newday: string) => {
    setregisterData({
      ...registerData,
      birthdate: {
        ...registerData.birthdate,
        day: newday
      }
    })
  }

  const setyear = (newyear: string) => {
    setregisterData({
      ...registerData,
      birthdate: {
        ...registerData.birthdate,
        year: newyear
      }
    })
  }

  const mutatename = (indicator: string, value: string) => {
    switch(indicator){
      case "firstName":
        setregisterData({
          ...registerData,
          fullname:{
            ...registerData.fullname,
            firstName: value
          }
        });
        break;
      case "middleName":
        setregisterData({
          ...registerData,
          fullname:{
            ...registerData.fullname,
            middleName: value
          }
        });
        break;
      case "lastName":
        setregisterData({
          ...registerData,
          fullname:{
            ...registerData.fullname,
            lastName: value
          }
        });
        break;
      default:
        return false;
    }
  }

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
            <input type="text" placeholder="First Name" value={registerData.fullname.firstName} onChange={(e) => { mutatename("firstName", e.target.value) }} id="firstname" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" placeholder="Middle Name (optional)" value={registerData.fullname.middleName} onChange={(e) => { mutatename("middleName", e.target.value) }} id="middlename" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" placeholder="Last Name" value={registerData.fullname.lastName} onChange={(e) => { mutatename("lastName", e.target.value) }} id="lastname" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full flex items-center justify-center flex-row gap-[5px]">
            <div className='w-full flex flex-row items-center justify-center max-w-[400px] gap-[10px]'>
              <select className='p-[10px] border-[#e8eaed] border-[1px] flex flex-1 h-[45px]' placeholder='Month' value={registerData.birthdate.month} onChange={(e) => { setmonth(e.target.value) }}>
                <option value="" defaultValue={""}>Month</option>
                {monthList.map((val, i) => {
                  return(
                    <option key={i} value={val}>{val}</option>
                  )
                })}
              </select>
              <select className='p-[10px] border-[#e8eaed] border-[1px] flex flex-1 h-[45px]' placeholder='Day' value={registerData.birthdate.day} onChange={(e) => {
                setday(e.target.value)
              }}>
                <option value="" defaultValue={""}>Day</option>
                {registerData.birthdate.month != "" && registerData.birthdate.year != ""? (
                  getDaysInMonth(registerData.birthdate.month, parseInt(registerData.birthdate.year)).map((val, i) => {
                    return(
                      <option key={i} value={val}>{val}</option>
                    )
                  })
                ) : null}
              </select>
              <select className='p-[10px] border-[#e8eaed] border-[1px] flex flex-1 h-[45px]' placeholder='Year' value={registerData.birthdate.year} onChange={(e) => { setyear(e.target.value) }}>
                <option value="" defaultValue={""}>Year</option>
                {years.map((val, i) => {
                  return(
                    <option key={i} value={val}>{val}</option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" value={registerData.contact} onChange={(e) => { setregisterData({ ...registerData, contact: e.target.value }) }} placeholder="Contact Number" id="contact" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="text" value={registerData.email} onChange={(e) => { setregisterData({ ...registerData, email: e.target.value }) }} placeholder="Email" id="email" className="flex flex-1 pl-[15px] pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
            <input type="password" value={registerData.password} onChange={(e) => { setregisterData({ ...registerData, password: e.target.value }) }} placeholder="Password" className="flex flex-1 pl-[15px]  pr-[15px] text-[14px]" />
          </div>
          <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px] pt-[20px]">
            <button 
            onClick={() => {
              RegisterProcess();
            }}
            className="flex flex-row justify-center items-center gap-1 bg-black border-[2px] border-[#000000] w-full h-[40px] rounded-[5px] text-center text-white text-[15px] font-semibold">Confirm</button>
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