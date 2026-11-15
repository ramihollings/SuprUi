import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { motionDurations, motionEaseOut } from "../../lib/motion";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Footer actions, e.g. a cancel + confirm Button pair. */
  actions?: ReactNode;
}

/**
 * Dialog. Controlled via `open` / `onOpenChange`. Focus is trapped while
 * open and returned on close (Base UI). Enter transition uses the token
 * slow duration (320ms) via Motion.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-background/70 transition-opacity duration-base data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <BaseDialog.Popup
          render={
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: motionDurations.slow, ease: motionEaseOut }}
            />
          }
          className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-extra-rounded border border-border bg-surface-raised p-6 text-text"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <BaseDialog.Title className="text-lg font-semibold text-text">
                {title}
              </BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className="text-sm text-text-muted">
                  {description}
                </BaseDialog.Description>
              ) : null}
            </div>
            <BaseDialog.Close
              aria-label="Close dialog"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-rounded text-text-muted transition-colors duration-fast hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
            >
              <X className="size-4" aria-hidden="true" />
            </BaseDialog.Close>
          </div>
          <div className="mt-4 text-sm text-text">{children}</div>
          {actions ? (
            <div className="mt-6 flex justify-end gap-2">{actions}</div>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
