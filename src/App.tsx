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
// import Register from './app/auth/Register'

function App() {

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication)
  const dispatch = useDispatch()

  const validateAuthToken = (authtokenlocal: string) => {
    try{
      var authtokendecode = jwtDecode(authtokenlocal)
        
        if(authtokendecode){
          // console.log(authtokendecode)
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
    initAuthentication()
  }, [])
  

  return (
    <div id='div_app'>
      <Routes>
        <Route path='/*' element={authentication.auth != null? authentication.auth? <Home /> : <Navigate to={'/login'} /> : null} />
        <Route path='/login' element={authentication.auth != null? authentication.auth? <Navigate to={'/'} /> : <Login /> : null} />
        <Route path='/register' element={authentication.auth != null? authentication.auth? <Navigate to={'/'} /> : <Register /> : null} />
        <Route path='/verify' element={authentication.auth != null? authentication.auth? authentication.user.isVerified? <Navigate to={'/'} /> : <Verification /> : <Navigate to={'/login'} /> : null} />
      </Routes>
    </div>
  )
}

export default App
