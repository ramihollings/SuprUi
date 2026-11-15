/**
 * Switch — Supr UI native, built on `@rn-primitives/switch`.
 *
 * Controlled via `checked` / `onCheckedChange`. The thumb slides on
 * the snappy token spring (stiffness 400, damping 30 — "responsive
 * controls" per the repo motion rules); the track swaps to the brand
 * token when checked. State is exposed to assistive technology through
 * the primitive's `switch` role and `accessibilityState`.
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as SwitchPrimitive from '@rn-primitives/switch';
import { useTheme } from '../../theme';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
}: SwitchProps) {
  const t = useTheme();

  // Track 48 x 24, thumb 20: all steps of the spacing token.
  const trackWidth = t.spacing[12];
  const trackHeight = t.spacing[6];
  const thumbSize = t.spacing[5];
  const thumbTravel = trackWidth - thumbSize - t.spacing[1];

  const position = useSharedValue(checked ? 1 : 0);

  // Thumb travel on the snappy token spring. (In tests the Reanimated
  // mock resolves withSpring to its target synchronously.)
  useEffect(() => {
    position.value = withSpring(checked ? 1 : 0, {
      stiffness: t.motion.springSnappy.stiffness,
      damping: t.motion.springSnappy.damping,
    });
  }, [checked, position, t.motion.springSnappy.stiffness, t.motion.springSnappy.damping]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * thumbTravel }],
  }));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[2],
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        style={{
          width: trackWidth,
          height: trackHeight,
          borderRadius: t.radii.circular,
          // Unchecked track is the track token (#737373): its boundary vs
          // the page is 4.43:1 dark / 4.74:1 light (WCAG 1.4.11 needs 3:1);
          // the old border-strong track was 2.03:1 dark / 1.48:1 light, and
          // the white thumb on the light track was 1.48:1. No border: the
          // fill itself is the control boundary, and a border-strong rim
          // would fail 3:1 against the page in both themes.
          backgroundColor: checked ? t.colors.brand : t.colors.track,
          borderWidth: t.borderWidth.none,
          justifyContent: 'center',
          paddingHorizontal: t.spacing[1] / 2,
        }}
      >
        {/* asChild: the thumb's animated style needs an Animated host. */}
        <SwitchPrimitive.Thumb asChild>
          <Animated.View
            style={[
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: t.radii.circular,
                backgroundColor: t.colors.brandForeground,
              },
              thumbStyle,
            ]}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {label ? (
        <Text
          style={{
            color: t.colors.text,
            fontSize: t.typography.sizes.base.fontSize,
            lineHeight: t.typography.sizes.base.lineHeight,
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}
