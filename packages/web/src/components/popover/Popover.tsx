import { Popover as BasePopover } from "@base-ui/react/popover";
import { motion } from "motion/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { motionDurations, motionEaseOut } from "../../lib/motion";

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

/**
 * Popover. Controlled via `open` / `onOpenChange`. The trigger must be an
 * element (a Button is the usual choice); plain text is wrapped in a span.
 * Enter transition uses the token slow duration (320ms) via Motion.
 */
export function Popover({
  trigger,
  content,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
}: PopoverProps) {
  const triggerElement: ReactElement = isValidElement(trigger) ? (
    trigger
  ) : (
    <span>{trigger}</span>
  );

  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger render={triggerElement} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} className="z-50">
          <BasePopover.Popup
            aria-label="Popover"
            render={
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: motionDurations.slow, ease: motionEaseOut }}
              />
            }
            className="rounded-extra-rounded border border-border bg-surface-raised p-4 text-sm text-text"
          >
            {content}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
