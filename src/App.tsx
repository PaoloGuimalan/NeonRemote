/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "./App.css";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./app/home/Home";
import Login from "./app/auth/Login";
import { useDispatch, useSelector } from "react-redux";
import { AuthStateInterface } from "./hooks/interfaces";
import jwtDecode from "jwt-decode";
import { SET_AUTHENTICATION } from "./redux/types";
import { Toaster } from "./components/ui/toaster";
import { RefreshAuthRequest } from "./hooks/requests";
import { useToast } from "./components/ui/use-toast";
import Default from "./app/home/Default";
import { OrganizationProvider } from "./app/context/OrganizationContext";

function App() {
  const authentication: AuthStateInterface = useSelector(
    (state: any) => state.authentication,
  );
  const dispatch = useDispatch();
  const { toast } = useToast();

  const validateAuthToken = (authtokenlocal: string) => {
    try {
      const authtokendecode: any = jwtDecode(authtokenlocal);

      if (authtokendecode) {
        // console.log(authtokendecode.token)
        RefreshAuthRequest(authtokendecode.token, authtokendecode.username)
          .then((response) => {
            if (response.data) {
              toast({
                title: "Session Logged In",
              });
              dispatch({
                type: SET_AUTHENTICATION,
                payload: {
                  authentication: {
                    auth: true,
                    user: authtokendecode,
                  },
                },
              });
            }
          })
          .catch((err) => {
            toast({
              title: "Request Error",
              description: err.message,
              variant: "destructive",
            });
            dispatch({
              type: SET_AUTHENTICATION,
              payload: {
                authentication: {
                  ...authentication,
                  auth: false,
                },
              },
            });
            // logoutProcess()
          });
      } else {
        dispatch({
          type: SET_AUTHENTICATION,
          payload: {
            authentication: {
              ...authentication,
              auth: false,
            },
          },
        });
      }
    } catch (ex) {
      dispatch({
        type: SET_AUTHENTICATION,
        payload: {
          authentication: {
            ...authentication,
            auth: false,
          },
        },
      });
    }
  };

  const initAuthentication = () => {
    const authtokenlocal = localStorage.getItem("authtoken");

    if (authtokenlocal) {
      validateAuthToken(authtokenlocal);
    } else {
      dispatch({
        type: SET_AUTHENTICATION,
        payload: {
          authentication: {
            ...authentication,
            auth: false,
          },
        },
      });
    }
  };

  useEffect(() => {
    initAuthentication();
  }, []);

  return (
    <div id="div_app">
      <div className="font-Inter">
        <Toaster />
      </div>
      {/* The is_verified gate that used to wrap every route is gone along with
          /register and /verify. Verification belongs to Chatterloop now, and
          its own login refuses an unverified account - so a session that
          reaches Neon at all is already verified, and a second check here
          could only ever disagree with the service that owns the answer. */}
      <Routes>
        <Route
          path="/*"
          element={
            authentication.auth != null ? (
              authentication.auth ? (
                // The provider sits inside the signed-in branch because it
                // calls the API immediately - mounting it around the whole
                // tree would fire a request with no token on every visit to
                // the login page.
                <OrganizationProvider>
                  <Home />
                </OrganizationProvider>
              ) : (
                <Navigate to={"/login"} />
              )
            ) : (
              <Default />
            )
          }
        />
        <Route
          path="/login"
          element={
            authentication.auth != null ? (
              authentication.auth ? (
                <Navigate to={"/"} />
              ) : (
                <Login />
              )
            ) : (
              <Default />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
