"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThreeDots } from "react-loader-spinner";

const IsTypingLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`div_messages_result items-center ${className || ""}`}
      {...props}
    >
      <motion.div
        initial={{
          marginLeft: "0px",
          alignItems: "flex-start",
          scale: 0,
        }}
        animate={{
          marginLeft: "0px",
          alignItems: "flex-start",
          scale: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="flex flex-col w-fit max-w-[70%]"
      >
        <motion.div
          initial={{
            backgroundColor: "#f0f0f0",
            border: "solid 1px #f0f0f0",
            color: "#3b3b3b",
          }}
          animate={{
            backgroundColor: "#f0f0f0",
            border: "solid 1px #f0f0f0",
            color: "#3b3b3b",
          }}
          className="span_messages_result c1 h-[22px] min-w-[70px] min-h-[40px] flex flex-row gap-[5px] items-center justify-center rounded-md"
        >
          <ThreeDots
            visible={true}
            height="30"
            width="30"
            color="#000000"
            radius="30"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </motion.div>
      </motion.div>
    </div>
  );
});

IsTypingLoader.displayName = "IsTypingLoader";

export default IsTypingLoader;
