import { Route, Routes } from 'react-router-dom'
import DevicesList from './Devices/DevicesList'
import DeviceItem from './Devices/DeviceItem'

function Devices() {
  return (
    <Routes>
      <Route path='/' element={<DevicesList />} />
      <Route path='/:deviceID' element={<DeviceItem />} />
    </Routes>
  )
}

export default Devices