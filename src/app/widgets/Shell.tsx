/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The pieces every platform screen is built from.
 *
 * Kept together because they are only worth having if they are used
 * consistently - the value is that a loading state, an empty state and an
 * error look the same everywhere, not that any one of them is clever.
 *
 * Plain elements rather than more Radix packages: a `<select>` and a few divs
 * need no dependency, and adding four more to render a table would be paying
 * a bundle for styling.
 */
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { FiAlertCircle, FiInbox, FiLoader } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-col flex-1 bg-transparent overflow-y-auto x-scroll p-[20px] font-Inter gap-[20px]">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="w-full flex flex-row items-start gap-[20px]">
      <div className="flex flex-col flex-1 gap-[4px]">
        <span className="text-[20px] font-semibold leading-none">{title}</span>
        {description && (
          <span className="text-[13px] text-[#767676] max-w-[640px]">{description}</span>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      // `cn` rather than string concatenation: a caller passing "flex-row"
      // would otherwise lose to the "flex-col" below, because CSS resolves the
      // conflict by stylesheet order rather than by class-attribute order.
      // tailwind-merge drops the overridden one instead.
      className={cn(
        "flex flex-col border-[1px] rounded-[10px] border-[#e5e6ea] bg-white p-[16px] gap-[10px]",
        onClick && "cursor-pointer hover:border-[#c9ccd4]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="w-full grid gap-[12px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-[10px] py-[60px] text-[#767676]">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="flex"
      >
        <FiLoader style={{ fontSize: "26px" }} />
      </motion.span>
      <span className="text-[13px]">{label}…</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-[10px] py-[60px] text-center">
      <FiInbox style={{ fontSize: "44px", color: "#b3b3b3" }} />
      <span className="text-[14px] font-semibold text-[#4d4d4d]">{title}</span>
      {description && (
        <span className="text-[13px] text-[#767676] max-w-[420px]">{description}</span>
      )}
      {action}
    </div>
  );
}

/** A problem the user might be able to do something about. Never swallowed. */
export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <div className="w-full flex flex-row items-start gap-[10px] rounded-[8px] border-[1px] border-[#f3c6c4] bg-[#fdf3f2] p-[12px]">
      <FiAlertCircle style={{ fontSize: "18px", color: "#c0392b", flexShrink: 0, marginTop: 1 }} />
      <span className="flex flex-1 text-[13px] text-[#8c2f27] whitespace-pre-line">{message}</span>
      {onRetry && (
        <Button variant="outline" className="h-[28px] text-[12px]" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/** Neutral information - a configuration gap, not a failure. */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-row items-start gap-[10px] rounded-[8px] border-[1px] border-[#e2e4ea] bg-[#f7f8fa] p-[12px]">
      <FiAlertCircle style={{ fontSize: "18px", color: "#6b7280", flexShrink: 0, marginTop: 1 }} />
      <div className="flex flex-1 flex-col text-[13px] text-[#4b5563] gap-[6px]">{children}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col gap-[5px]">
      <span className="text-[13px] font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="text-[12px] text-[#767676]">{hint}</span>}
      {error && <span className="text-[12px] text-[#c0392b]">{error}</span>}
    </div>
  );
}

export function Select({
  value,
  onChange,
  children,
  disabled,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-[38px] rounded-[7px] border-[1px] border-[#e5e6ea] bg-white px-[10px] text-[13px] outline-none focus:border-[#b3b3b3] disabled:opacity-50",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "bg-[#f0f1f4] text-[#4b5563]",
    good: "bg-[#e7f6ec] text-[#1f7a3f]",
    warn: "bg-[#fdf4e3] text-[#8a6100]",
    bad: "bg-[#fdf3f2] text-[#8c2f27]",
  };
  return (
    <span className={`text-[11px] font-semibold px-[8px] py-[3px] rounded-[20px] ${tones[tone]}`}>
      {children}
    </span>
  );
}
