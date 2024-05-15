import NeonIconPNG from '../../assets/NeonPOS.png';
import NeonPOSSVG from '../../assets/NeonPOS_BG.svg'
import { motion } from 'framer-motion';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

function Default() {
  return (
    <div style={{ background: `url(${NeonPOSSVG})`, backgroundSize: "cover", backgroundPosition: "bottom", backgroundRepeat: "no-repeat" }} className='w-full h-full flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center gap-[10px]'>
            <img src={NeonIconPNG} className='h-full max-h-[200px] cursor-pointer object-cover' />
            <div className='w-full flex items-center justify-center'>
                <motion.div
                animate={{
                    rotate: 360
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1
                }}
                >
                    <AiOutlineLoading3Quarters style={{ fontSize: "25px" }} />
                </motion.div>
            </div>
        </div>
    </div>
  )
}

export default Default