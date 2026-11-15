import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const avatarVariants = cva("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-circular bg-brand font-medium text-brand-foreground", {
  variants: {
    size: {
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-12 text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  /** Shown when `src` is absent or fails to load. */
  fallback: string;
  alt: string;
}

export function Avatar({ src, fallback, size, alt }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size }))}>
      {src ? (
        <BaseAvatar.Image src={src} alt={alt} className="size-full object-cover" />
      ) : null}
      <BaseAvatar.Fallback className="flex size-full items-center justify-center">
        {fallback}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
