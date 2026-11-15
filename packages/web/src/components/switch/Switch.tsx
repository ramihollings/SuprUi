import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { useId } from "react";
import { motion } from "motion/react";
import { motionSpringSnappy } from "../../lib/motion";
import { cn } from "../../lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Switch. State is exposed via the button's `aria-checked` (Base UI).
 * Thumb motion uses the token snappy spring.
 */
export function Switch({ checked, onCheckedChange, label, disabled }: SwitchProps) {
  const id = useId();

  const control = (
    <BaseSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={(nextChecked) => onCheckedChange(nextChecked)}
      disabled={disabled}
      className={cn(
        // Unchecked track is the track token (#737373): its boundary vs
        // the page is 4.43:1 dark / 4.74:1 light (WCAG 1.4.11 needs 3:1);
        // the old surface track was 1.06:1 dark / 1.09:1 light. No border:
        // the fill itself is the control boundary, and a border-strong rim
        // would fail 3:1 against the page in both themes.
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-circular bg-track transition-colors duration-fast",
        "data-[checked]:bg-brand",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <BaseSwitch.Thumb
        render={
          <motion.span
            animate={{ x: checked ? 20 : 0 }}
            transition={motionSpringSnappy}
          />
        }
        className="ml-0.5 block size-5 rounded-circular bg-text"
      />
    </BaseSwitch.Root>
  );

  if (!label) {
    return control;
  }

  return (
    <div className="flex items-center gap-2">
      {control}
      <label htmlFor={id} className="cursor-pointer text-sm text-text">
        {label}
      </label>
    </div>
  );
}
