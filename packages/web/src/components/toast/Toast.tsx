import { Toast as BaseToast } from "@base-ui/react/toast";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { motionDurations, motionEaseOut } from "../../lib/motion";
import { cn } from "../../lib/utils";

/** Singleton manager backing the imperative `toast()` API. */
const toastManager = BaseToast.createToastManager();

export type ToastVariant = "default" | "success" | "error" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

const variantIcons: Record<ToastVariant, LucideIcon> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const variantIconClasses: Record<ToastVariant, string> = {
  default: "text-text-muted",
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
};

/**
 * Show a toast. Requires a `<Toaster />` rendered once at the app root.
 * Color is never the only signal: every variant pairs its color with an icon.
 */
export function toast({ title, description, variant = "default" }: ToastOptions) {
  toastManager.add({
    title,
    description,
    // Base UI stores this as `type`; we read it back in <Toaster />.
    type: variant,
  });
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((item) => {
    const variant = (item.type as ToastVariant | undefined) ?? "default";
    const Icon = variantIcons[variant];
    return (
      <BaseToast.Root
        key={item.id}
        toast={item}
        render={
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionDurations.base, ease: motionEaseOut }}
          />
        }
        className="flex w-full items-start gap-3 rounded-extra-rounded border border-border bg-surface-raised p-4 text-text"
      >
        <Icon
          className={cn("mt-0.5 size-5 shrink-0", variantIconClasses[variant])}
          aria-hidden="true"
        />
        <BaseToast.Content className="flex min-w-0 flex-1 flex-col gap-0.5">
          <BaseToast.Title className="text-sm font-semibold text-text" />
          <BaseToast.Description className="text-sm text-text-muted" />
        </BaseToast.Content>
        <BaseToast.Close
          aria-label="Dismiss toast"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-rounded text-text-muted transition-colors duration-fast hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
        >
          <X className="size-4" aria-hidden="true" />
        </BaseToast.Close>
      </BaseToast.Root>
    );
  });
}

/**
 * Render once at the app root. Toasts are added imperatively via `toast()`.
 */
export function Toaster() {
  return (
    // `limit` is above Base UI's default of 3 so a burst of toasts (e.g. a
    // form save followed by two confirmations) stays visible instead of
    // the oldest going inert.
    <BaseToast.Provider toastManager={toastManager} limit={10}>
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
