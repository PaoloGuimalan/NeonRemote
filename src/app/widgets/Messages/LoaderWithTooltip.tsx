/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import IsTypingLoader from "./IsTypingLoader";

const LoaderWithTooltip = React.forwardRef<
  HTMLDivElement,
  { className?: string; data: string }
>(({ data, className }, _ref) => {
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip open={true}>
        <TooltipTrigger asChild>
          <IsTypingLoader className={className} />
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="animate-none opacity-100 border-0 bg-[#f0f0f0] min-h-[40px] flex items-center text-[12px] shadow-lg z-[0]"
        >
          {data}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

LoaderWithTooltip.displayName = "LoaderWithTooltip";

export default LoaderWithTooltip;
