import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

/** Compound Tabs. Arrow-key navigation is provided by Base UI. */
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <BaseTabs.Root
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as string)}
      className={cn("flex flex-col gap-4", className)}
    >
      {children}
    </BaseTabs.Root>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BaseTabs.List className={cn("inline-flex items-center gap-1 self-start rounded-rounded border border-border bg-surface p-1", className)}>
      {children}
    </BaseTabs.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BaseTabs.Tab
      value={value}
      className={cn(
        "rounded-rounded px-3 py-1.5 text-sm font-medium text-text-muted transition-colors duration-fast hover:text-text focus-visible:outline-2 focus-visible:outline-focus data-[selected]:bg-surface-raised data-[selected]:text-text",
        className,
      )}
    >
      {children}
    </BaseTabs.Tab>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BaseTabs.Panel value={value} className={cn("text-sm text-text", className)}>
      {children}
    </BaseTabs.Panel>
  );
}
