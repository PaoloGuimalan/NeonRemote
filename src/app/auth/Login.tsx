/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyboardEvent } from "react";
import {
  LoginRequest,
  ThirdPartyAuthenticationRequest,
} from "@/hooks/requests";
import { checkIfValid } from "@/hooks/reusables";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import { envs } from "@/hooks/configs";
import jwtDecode from "jwt-decode";
import { SET_AUTHENTICATION } from "@/redux/types";
import sign from "jwt-encode";

function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const authentication = useSelector((state: any) => state.authentication);
  const dispatch = useDispatch();

  const loginRequestProcess = () => {
    if (checkIfValid([email, password])) {
      LoginRequest(
        {
          email_username: email,
          password: password,
        },
        dispatch,
        authentication,
      );
      toast({
        title: "Logged In",
      });
    } else {
      // console.log("Please complete the fields")
      toast({
        title: "Please complete the fields",
      });
    }
  };

  const loginKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code == "Enter") {
      loginRequestProcess();
    }
  };

  const TPAuthProcess = (token: string) => {
    ThirdPartyAuthenticationRequest({ token })
      .then((response: any) => {
        if (response.status) {
          const decodedToken: any = jwtDecode(response.result.usertoken);
          const userdata = decodedToken;
          const authtoken = {
            ...userdata,
            token: response.result.authtoken,
          };

          const encodedAuthToken = sign(authtoken, envs.SECRET);
          localStorage.setItem("authtoken", encodedAuthToken);
          dispatch({
            type: SET_AUTHENTICATION,
            payload: {
              authentication: {
                auth: true,
                user: authtoken,
              },
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <GoogleOAuthProvider clientId={envs.GOOGLE_CLIENT_ID}>
      <div className="bg-[#fafafa] w-full h-full flex flex-col justify-center items-center font-Inter">
        <div className="bg-transparent w-[95%] max-w-[500px] flex flex-col gap-[30px]">
          <span className="font-bold text-[35px]">Neon Remote</span>
          <div className="flex flex-col w-full max-w-[400px] items-start self-center">
            <span className="mb-[20px] border-b-[2px] border-[#000000] pb-[5px] text-[15px] font-semibold">
              Login
            </span>
            <hr className="w-full max-w-[400px] border-[1px] border-[#e8eaed]" />
          </div>
          <div className="flex flex-col gap-[10px] items-center">
            <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
              <input
                value={email}
                onChange={(e) => {
                  setemail(e.target.value);
                }}
                onKeyDown={loginKeyDown}
                type="text"
                placeholder="Email"
                className="flex flex-1 pl-[15px] pr-[15px] text-[14px]"
              />
            </div>
            <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
              <input
                value={password}
                onChange={(e) => {
                  setpassword(e.target.value);
                }}
                onKeyDown={loginKeyDown}
                type="password"
                placeholder="Password"
                className="flex flex-1 pl-[15px]  pr-[15px] text-[14px]"
              />
            </div>
            <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px]">
              <input type="checkbox" className="w-[15px] cursor-pointer" />
              <span className="text-[15px] -mt-[1px]">Remember Me</span>
            </div>
            <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px]">
              <button
                onClick={() => {
                  loginRequestProcess();
                }}
                className="flex flex-row justify-center items-center gap-1 bg-black border-[2px] border-[#000000] w-full h-[40px] rounded-[5px] text-center text-white text-[15px] font-semibold"
              >
                Login
              </button>
            </div>
            <div className="flex flex-col w-[90%] items-center pt-[20px]">
              <hr className="w-full max-w-[400px] border-[1px] border-[#e8eaed]" />
              <span className="font-Inter text-[#3a3a3a] text-[14px] p-[5px] pl-[10px] pr-[10px] -mt-[17px] bg-[#fafafa] w-fit font-semibold">
                OR
              </span>
            </div>
            <GoogleLogin
              onSuccess={(credentialResponse: CredentialResponse) => {
                if (credentialResponse.credential) {
                  TPAuthProcess(credentialResponse.credential);
                } else {
                  console.log("Unable to login using this account.");
                }
              }}
              onError={() => {
                console.log("There was a problem logging in with Google.");
              }}
            />
            <div className="w-full bg-transparent max-w-[400px] h-[45px] flex flex-row items-center gap-[5px] pt-[20px] justify-center">
              <span className="text-[14px] -mt-[1px]">
                Do not have an account?
              </span>
              <a
                onClick={() => {
                  navigate("/register");
                }}
                className="text-[14px] -mt-[1px] cursor-pointer border-b-[1px] border-[#000000]"
              >
                Create an account.
              </a>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
