import './App.css'
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './app/home/Home'
import Login from './app/auth/Login'
import { useDispatch, useSelector } from 'react-redux'
import { AuthStateInterface } from './hooks/interfaces'
import jwtDecode from 'jwt-decode';
import { SET_AUTHENTICATION } from './redux/types';
import Register from './app/auth/Register';
import Verification from './app/auth/Verification';
import { Toaster } from './components/ui/toaster';
import { RefreshAuthRequest } from './hooks/requests';
import { useToast } from './components/ui/use-toast';
import Default from './app/home/Default';
// import Register from './app/auth/Register'

function App() {

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication)
  const dispatch = useDispatch()
  const { toast } = useToast();

  const validateAuthToken = (authtokenlocal: string) => {
    try{
      var authtokendecode : any = jwtDecode(authtokenlocal)
        
        if(authtokendecode){
          // console.log(authtokendecode.token)
          RefreshAuthRequest(authtokendecode.token).then((response) => {
            if(!response.data.status){
              toast({
                title: response.data.message
              })
              dispatch({
                type: SET_AUTHENTICATION,
                payload:{
                  authentication:{
                    ...authentication,
                    auth: false
                  }
                }
              })
              // logoutProcess()
            }
            else{
              // console.log(response.data);
              dispatch({
                type: SET_AUTHENTICATION,
                payload:{
                  authentication:{
                    auth: true,
                    user: authtokendecode
                  }
                }
              })
            }
          }).catch((err) => {
            toast({
              title: "Request Error",
              description: err.message,
              variant: "destructive"
            })
            dispatch({
              type: SET_AUTHENTICATION,
              payload:{
                authentication:{
                  ...authentication,
                  auth: false
                }
              }
            })
            // logoutProcess()
          })
        }
        else{
          dispatch({
            type: SET_AUTHENTICATION,
            payload:{
              authentication:{
                ...authentication,
                auth: false
              }
            }
          })
        }
    }catch(ex){
      dispatch({
        type: SET_AUTHENTICATION,
        payload:{
          authentication:{
            ...authentication,
            auth: false
          }
        }
      })
    }
  }

  const initAuthentication = () => {
      var authtokenlocal = localStorage.getItem("authtoken")
      
      if(authtokenlocal){
        validateAuthToken(authtokenlocal)
      }
      else{
        dispatch({
          type: SET_AUTHENTICATION,
          payload:{
            authentication:{
              ...authentication,
              auth: false
            }
          }
        })
      }
  }

  useEffect(() => {
    initAuthentication();
  }, [])
  

  return (
    <div id='div_app'>
      <div className='font-Inter'>
        <Toaster />
      </div>
      <Routes>
        <Route path='/*' element={authentication.auth != null? authentication.auth? authentication.user.isVerified? <Home /> : <Navigate to={'/verify'} /> : <Navigate to={'/login'} /> : <Default />} />
        <Route path='/login' element={authentication.auth != null? authentication.auth? authentication.user.isVerified? <Navigate to={'/'} /> : <Navigate to={'/verify'} /> : <Login /> : <Default />} />
        <Route path='/register' element={authentication.auth != null? authentication.auth?  authentication.user.isVerified? <Navigate to={'/'} /> : <Navigate to={'/verify'} /> : <Register /> : <Default />} />
        <Route path='/verify' element={authentication.auth != null? authentication.auth? authentication.user.isVerified? <Navigate to={'/'} /> : <Verification /> : <Navigate to={'/login'} /> : <Default />} />
      </Routes>
    </div>
  )
}

export default App
