/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyboardEvent, useState } from "react";
import {
  LoginRequest,
  ThirdPartyAuthenticationRequest,
} from "@/hooks/requests";
import { checkIfValid } from "@/hooks/reusables";
import { useDispatch, useSelector } from "react-redux";
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

/**
 * Sign in with a Chatterloop account.
 *
 * Neon has no accounts of its own any more: it forwards the credential to
 * Chatterloop, which owns passwords, verification and account standing, then
 * mirrors the identity and issues its own session. There is no registration
 * screen here for the same reason - an account is created on Chatterloop.
 */
function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [busy, setbusy] = useState(false);

  const { toast } = useToast();
  const authentication = useSelector((state: any) => state.authentication);
  const dispatch = useDispatch();

  const failed = (description: string) =>
    toast({
      title: "Could not sign in",
      // Chatterloop's own wording, passed through: it knows whether the
      // account is deactivated, unverified or the password is simply wrong,
      // and that is the only thing that tells someone what to do next.
      description,
      variant: "destructive",
    });

  const loginRequestProcess = () => {
    if (!checkIfValid([email, password])) {
      toast({ title: "Enter your Chatterloop email and password" });
      return;
    }

    setbusy(true);
    LoginRequest(
      { email_username: email, password },
      dispatch,
      authentication,
      (message) => {
        setbusy(false);
        failed(message);
      },
    );
  };

  const loginKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      loginRequestProcess();
    }
  };

  const TPAuthProcess = (token: string) => {
    setbusy(true);
    ThirdPartyAuthenticationRequest({ token })
      .then((response: any) => {
        if (!response?.status) {
          setbusy(false);
          failed(response?.message || "Chatterloop rejected the sign-in.");
          return;
        }

        const decodedToken: any = jwtDecode(response.result.usertoken);
        const authtoken = { ...decodedToken, token: response.result.authtoken };

        localStorage.setItem("authtoken", sign(authtoken, envs.SECRET));
        dispatch({
          type: SET_AUTHENTICATION,
          payload: { authentication: { auth: true, user: authtoken } },
        });
      })
      .catch((err) => {
        setbusy(false);
        failed(err.message);
      });
  };

  return (
    <GoogleOAuthProvider clientId={envs.GOOGLE_CLIENT_ID}>
      <div className="bg-[#fafafa] w-full h-full flex flex-col justify-center items-center font-Inter">
        <div className="bg-transparent w-[95%] max-w-[500px] flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[6px]">
            <span className="font-bold text-[35px]">Neon</span>
            <span className="text-[14px] text-[#525252]">
              Build agents and publish them to Chatterloop.
            </span>
          </div>
          <div className="flex flex-col w-full max-w-[400px] items-start self-center">
            <span className="mb-[20px] border-b-[2px] border-[#000000] pb-[5px] text-[15px] font-semibold">
              Sign in with Chatterloop
            </span>
            <hr className="w-full max-w-[400px] border-[1px] border-[#e8eaed]" />
          </div>
          <div className="flex flex-col gap-[10px] items-center">
            <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
              <input
                value={email}
                onChange={(e) => setemail(e.target.value)}
                onKeyDown={loginKeyDown}
                type="text"
                placeholder="Chatterloop email or username"
                autoComplete="username"
                className="flex flex-1 pl-[15px] pr-[15px] text-[14px]"
              />
            </div>
            <div className="w-full bg-white max-w-[400px] h-[45px] flex flex-row border-[#e8eaed] border-[1px]">
              <input
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                onKeyDown={loginKeyDown}
                type="password"
                placeholder="Chatterloop password"
                autoComplete="current-password"
                className="flex flex-1 pl-[15px] pr-[15px] text-[14px]"
              />
            </div>
            <div className="w-full bg-transparent max-w-[400px] flex flex-row items-center gap-[5px] pt-[10px]">
              <button
                onClick={loginRequestProcess}
                disabled={busy}
                className="flex flex-row justify-center items-center gap-1 bg-black border-[2px] border-[#000000] w-full h-[40px] rounded-[5px] text-center text-white text-[15px] font-semibold disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Sign in"}
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
                  failed("Google did not return a usable credential.");
                }
              }}
              onError={() => {
                failed("There was a problem signing in with Google.");
              }}
            />
            <div className="w-full bg-transparent max-w-[400px] flex flex-col items-center gap-[4px] pt-[25px] text-center">
              <span className="text-[13px] text-[#525252]">
                Neon uses your Chatterloop account.
              </span>
              <span className="text-[13px] text-[#525252]">
                Do not have one? Create it on Chatterloop first.
              </span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
