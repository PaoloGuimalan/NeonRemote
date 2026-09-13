/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A form in a dialog, and a confirmation that names its consequence.
 *
 * `ConfirmDialog` takes a `consequence` rather than a generic "Are you sure?".
 * Several destructive actions here are not obviously destructive - deleting a
 * knowledge document removes what an agent answers from, disconnecting an
 * identity deactivates the bots running under it - and a dialog that does not
 * say so is not really a confirmation.
 */
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ErrorNotice } from "./Shell";

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  error,
  submitLabel = "Save",
  submitting,
  disabled,
  onSubmit,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  error?: string;
  submitLabel?: string;
  submitting?: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`font-Inter ${wide ? "max-w-2xl" : ""} max-h-[85vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="text-[17px]">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[13px]">{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-[14px] py-[4px]">
          <ErrorNotice message={error ?? ""} />
          {children}
        </div>

        <DialogFooter className="gap-[8px]">
          <Button variant="outline" className="h-[36px] text-[13px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-[36px] text-[13px] bg-black text-white hover:bg-black"
            disabled={submitting || disabled}
            onClick={onSubmit}
          >
            {submitting ? "Working…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  consequence,
  confirmLabel = "Confirm",
  destructive = true,
  working,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** What actually happens. Not "Are you sure?" - what it does. */
  consequence: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  working?: boolean;
  error?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-Inter">
        <DialogHeader>
          <DialogTitle className="text-[17px]">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[12px] text-[13px] text-[#4b5563]">
          <ErrorNotice message={error ?? ""} />
          {consequence}
        </div>

        <DialogFooter className="gap-[8px]">
          <Button variant="outline" className="h-[36px] text-[13px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={working}
            onClick={onConfirm}
            className={`h-[36px] text-[13px] text-white ${
              destructive ? "bg-[#dd524c] hover:bg-[#c8443e]" : "bg-black hover:bg-black"
            }`}
          >
            {working ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
