"use client";

import * as React from "react";
import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaAutosizeProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
  minHeight?: number;
}

export const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(
  ({
    className,
    maxHeight = 120,
    minHeight = 44,
    onChange,
    value,
    ...props
  }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to get accurate scrollHeight
      textarea.style.height = "auto";
      // Set new height based on content
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    }, [maxHeight, minHeight]);

    // Adjust on mount and value change
    React.useLayoutEffect(() => {
      adjustHeight();
    }, [adjustHeight]);

    // Listen for input events
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.addEventListener("input", adjustHeight);
        return () => textarea.removeEventListener("input", adjustHeight);
      }
    }, [adjustHeight]);

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          "overflow-hidden",
          "[&:focus]:border-none [&:focus]:outline-none [&:focus-visible]:outline-none [&:focus]:ring-0 [&:focus-visible]:ring-0",
          "border-transparent", // ✅ Transparent border
          "focus:border-transparent", // ✅ Transparent on focus
          "focus-visible:border-transparent",
          "focus:ring-0 focus-visible:ring-0",
          "focus:outline-none focus-visible:outline-none",
          "overflow-hidden",
          className,
        )}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          height: "auto", // Allow natural expansion
        }}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          adjustHeight();
        }}
        {...props}
      />
    );
  },
);

TextareaAutosize.displayName = "TextareaAutosize";
