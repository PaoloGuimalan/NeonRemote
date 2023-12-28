import { useParams } from 'react-router-dom'

function DeviceItem() {

  const deviceData = useParams();

  return (
    <div>DeviceItem DVC_{deviceData.deviceID}</div>
  )
}

export default DeviceItem