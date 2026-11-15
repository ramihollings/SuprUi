import { cva, type VariantProps } from "class-variance-authority";
import { useId, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "w-full rounded-rounded border border-border bg-surface text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 aria-[invalid=true]:border-danger",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">,
    VariantProps<typeof inputVariants> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Error message; renders the error state and exposes it to assistive tech. */
  error?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  size,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(inputVariants({ size }), className)}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
