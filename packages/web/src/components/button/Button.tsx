import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
        secondary: "border border-border bg-surface-raised text-text hover:bg-surface",
        outline: "border border-border-strong bg-transparent text-text hover:bg-surface",
        ghost: "bg-transparent text-text hover:bg-surface",
        danger: "bg-danger-solid text-brand-foreground hover:bg-danger-hover",
      },
      shape: {
        control: "rounded-rounded",
        pill: "rounded-circular",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "control",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional Lucide icon rendered before the label. */
  icon?: ReactNode;
}

/**
 * Button. Icon-only buttons must receive an accessible label
 * (e.g. `aria-label`) from the caller.
 */
export function Button({
  variant,
  size,
  shape,
  disabled,
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size, shape }), className)}
      disabled={disabled}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
