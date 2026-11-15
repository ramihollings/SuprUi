/**
 * Popover — Supr UI native, built on `@rn-primitives/popover`.
 *
 * Controlled via `open` / `onOpenChange`. Two native gaps, both
 * documented here and in the package README:
 *
 * 1. The primitive's Root is uncontrolled (no `open` prop). Control is
 *    synced through the Trigger ref's imperative `open()` / `close()`
 *    methods, and user toggles still report through `onOpenChange`.
 * 2. The primitive positions content only on `top` / `bottom` natively.
 *    `side="left"` / `"right"` are accepted for web parity and fall
 *    back to `"bottom"` on native.
 *
 * Enter motion uses the slow token duration (320ms — "slow only for
 * larger transitions" per the repo motion rules).
 *
 * Consumers must render `<PortalHost />` (from `@rn-primitives/portal`)
 * once at the app root, or portal content has nowhere to mount.
 */
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { isValidElement } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as PopoverPrimitive from '@rn-primitives/popover';
import type { TriggerRef } from '@rn-primitives/popover';
import { useTheme } from '../../theme';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: PopoverSide;
  align?: PopoverAlign;
}

export function Popover({
  trigger,
  content,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'center',
}: PopoverProps) {
  const t = useTheme();
  const triggerRef = useRef<TriggerRef>(null);
  const progress = useSharedValue(open ? 1 : 0);

  // Sync the primitive's uncontrolled open state with the controlled
  // prop. The ref starts at `false` (the primitive starts closed), so
  // an initially-closed popover performs no sync — calling `close()` on
  // mount would spuriously fire `onOpenChange(false)`.
  const prevOpen = useRef(false);
  useEffect(() => {
    if (prevOpen.current === open) {
      return;
    }
    prevOpen.current = open;
    if (open) {
      triggerRef.current?.open();
    } else {
      triggerRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: t.motion.durationSlow });
  }, [open, progress, t.motion.durationSlow]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  // Native positioning supports top/bottom only; left/right fall back.
  const nativeSide: 'top' | 'bottom' = side === 'top' ? 'top' : 'bottom';

  const triggerElement = isValidElement(trigger) ? (
    trigger
  ) : (
    <Pressable>
      <Text
        style={{
          color: t.colors.text,
          fontSize: t.typography.sizes.base.fontSize,
          lineHeight: t.typography.sizes.base.lineHeight,
        }}
      >
        {trigger}
      </Text>
    </Pressable>
  );

  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger ref={triggerRef} asChild>
        {triggerElement}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        {/* asChild: the animated style needs an Animated host; the
            primitive's style prop only accepts plain ViewStyle. */}
        <PopoverPrimitive.Content
          side={nativeSide}
          align={align}
          sideOffset={t.spacing[2]}
          asChild
        >
          <Animated.View
            style={[
              {
                backgroundColor: t.colors.surfaceRaised,
                borderRadius: t.radii.extraRounded,
                borderWidth: t.borderWidth.thin,
                borderColor: t.colors.border,
                padding: t.spacing[3],
              },
              contentStyle,
            ]}
          >
            {content}
          </Animated.View>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
