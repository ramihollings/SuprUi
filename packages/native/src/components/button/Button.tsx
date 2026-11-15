/**
 * Button — Supr UI native.
 *
 * Variants: primary / secondary / outline / ghost / danger.
 * Sizes: sm / md / lg (heights from the spacing token: 32 / 40 / 48).
 * Every colour, radius, spacing step and type size comes from the token
 * theme (`useTheme()`); no raw hex or pixel literal appears here.
 *
 * `onPress` is the native press handler — the web Button inherits
 * `onClick` from `<button>`; this is its native equivalent, not an
 * extra styling prop. Icon-only buttons must pass `accessibilityLabel`
 * (repo a11y rule: every icon-only control needs an accessible label).
 */
import { cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { Pressable, Text, type View } from 'react-native';
import { fontWeight, useTheme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /**
   * Forwarded to the underlying Pressable. Needed when a Button is a
   * Popover/Dialog trigger via `asChild`: the primitive attaches
   * imperative open/close methods to this ref.
   */
  ref?: Ref<View>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  icon,
  onPress,
  accessibilityLabel,
  ref,
}: ButtonProps) {
  const t = useTheme();

  const height =
    size === 'sm' ? t.spacing[8] : size === 'lg' ? t.spacing[12] : t.spacing[10];
  const fontSize =
    size === 'sm'
      ? t.typography.sizes.sm
      : size === 'lg'
        ? t.typography.sizes.lg
        : t.typography.sizes.base;
  const iconSize = fontSize.fontSize;

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? t.colors.brandForeground
      : t.colors.text;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => {
        let backgroundColor: string;
        let borderColor: string = t.colors.border;
        switch (variant) {
          case 'primary':
            backgroundColor = pressed ? t.colors.brandHover : t.colors.brand;
            borderColor = pressed ? t.colors.brandHover : t.colors.brand;
            break;
          case 'secondary':
            backgroundColor = pressed ? t.colors.surface : t.colors.surfaceRaised;
            break;
          case 'outline':
            backgroundColor = pressed ? t.colors.surface : 'transparent';
            borderColor = t.colors.borderStrong;
            break;
          case 'ghost':
            backgroundColor = pressed ? t.colors.surface : 'transparent';
            borderColor = 'transparent';
            break;
          case 'danger':
            // Pressed danger uses the solid danger-hover token, not an
            // opacity multiplier: white text on danger at 0.85 opacity
            // fell to 3.31:1 (light) / 4.00:1 (dark) against the page.
            // White on danger-hover is 6.47:1 in both themes.
            backgroundColor = pressed ? t.colors.dangerHover : t.colors.dangerSolid;
            borderColor = pressed ? t.colors.dangerHover : t.colors.dangerSolid;
            break;
          default:
            backgroundColor = t.colors.brand;
            borderColor = t.colors.brand;
            break;
        }
        return {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          paddingHorizontal: t.spacing[4],
          gap: t.spacing[2],
          borderRadius: t.radii.rounded,
          borderWidth: t.borderWidth.thin,
          borderColor,
          backgroundColor,
          // Disabled is the only opacity state left: danger press feedback
          // is a solid token swap now (see the danger case above).
          opacity: disabled ? 0.5 : 1,
        };
      }}
    >
      {icon
        ? isValidElement(icon)
          ? cloneElement(icon as ReactElement<{ size?: number; color?: string }>, {
              size: iconSize,
              color: textColor,
            })
          : icon
        : null}
      {typeof children === 'string' ? (
        <Text
          style={{
            color: textColor,
            fontSize: fontSize.fontSize,
            lineHeight: fontSize.lineHeight,
            fontWeight: fontWeight(t, 'semibold'),
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
