/**
 * Dialog — Supr UI native, built on `@rn-primitives/dialog`.
 *
 * Controlled via `open` / `onOpenChange`. The primitive supplies the
 * portal, overlay dismissal, Android back-button handling and focus
 * return; this file adds the Supr panel, the close button and the
 * enter/exit motion (slow token duration, gentle spring — "slow only
 * for larger transitions" per the repo motion rules).
 *
 * The scrim uses the background token at 0.6 opacity: in the dark
 * theme that is a black veil; in light it is a white veil. There is no
 * scrim token, and no black-scale entry in the native theme, so the
 * semantic background token is the token-correct choice.
 *
 * Consumers must render `<PortalHost />` (from `@rn-primitives/portal`)
 * once at the app root, or portal content has nowhere to mount.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { fontWeight, useTheme } from '../../theme';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
}: DialogProps) {
  const t = useTheme();
  const progress = useSharedValue(open ? 1 : 0);

  // Enter/exit on the slow token duration (320ms). Opacity and scale
  // below are both derived from this one progress value. (In tests the
  // Reanimated mock resolves withTiming to its target synchronously.)
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: t.motion.durationSlow });
  }, [open, progress, t.motion.durationSlow]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* asChild lets the animated styles (AnimatedStyle, not plain
            ViewStyle) reach an Animated host: the primitive's style
            props only accept plain styles. */}
        <DialogPrimitive.Overlay asChild closeOnPress>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: t.colors.background,
              },
              scrimStyle,
            ]}
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
                padding: t.spacing[4],
              },
              panelStyle,
            ]}
          >
            <View
              style={{
                width: '100%',
                backgroundColor: t.colors.surfaceRaised,
                borderRadius: t.radii.extraRounded,
                borderWidth: t.borderWidth.thin,
                borderColor: t.colors.border,
                padding: t.spacing[4],
              }}
            >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: t.spacing[2],
              }}
            >
              <View style={{ flex: 1 }}>
                <DialogPrimitive.Title
                  style={{
                    color: t.colors.text,
                    fontSize: t.typography.sizes.lg.fontSize,
                    lineHeight: t.typography.sizes.lg.lineHeight,
                    fontWeight: fontWeight(t, 'semibold'),
                  }}
                >
                  {title}
                </DialogPrimitive.Title>
                {description ? (
                  <DialogPrimitive.Description
                    style={{
                      color: t.colors.textMuted,
                      fontSize: t.typography.sizes.sm.fontSize,
                      lineHeight: t.typography.sizes.sm.lineHeight,
                      marginTop: t.spacing[1],
                    }}
                  >
                    {description}
                  </DialogPrimitive.Description>
                ) : null}
              </View>
              <Pressable
                onPress={() => onOpenChange(false)}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                style={{
                  padding: t.spacing[1],
                  borderRadius: t.radii.rounded,
                }}
              >
                <X size={t.typography.sizes.base.fontSize} color={t.colors.textMuted} />
              </Pressable>
            </View>
            <View style={{ marginTop: t.spacing[3] }}>{children}</View>
            {actions ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: t.spacing[2],
                  marginTop: t.spacing[4],
                }}
              >
                {actions}
              </View>
            ) : null}
            </View>
          </Animated.View>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
