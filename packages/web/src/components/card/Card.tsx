import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

/** Compound Card. Use the named subcomponents, not ad-hoc divs. */
export function Card({ children, className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-extra-rounded border border-border bg-surface p-6 text-text",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: DivProps & { children: ReactNode }) {
  // h2, not h3: the card title is the second-level heading under the
  // page h1. h3 skipped a level and failed axe `heading-order` in
  // Storybook (a11y fix, 2026-11-13). Visual styling is class-driven
  // and unchanged.
  return (
    <h2 className={cn("text-lg font-semibold text-text", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className, ...props }: DivProps) {
  return (
    <p className={cn("text-sm text-text-muted", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("text-sm text-text", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: DivProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}
