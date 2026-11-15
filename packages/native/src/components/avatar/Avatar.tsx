/**
 * Avatar — Supr UI native, built on `@rn-primitives/avatar`.
 *
 * `fallback` (usually initials) shows when `src` is absent or fails to
 * load; the primitive tracks the image load status and swaps the
 * fallback in on error. Sizes from the spacing token: 32 / 40 / 64.
 * Circular radius token for the frame.
 */
import { Text } from 'react-native';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { fontWeight, useTheme } from '../../theme';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: AvatarSize;
  alt: string;
}

export function Avatar({ src, fallback, size = 'md', alt }: AvatarProps) {
  const t = useTheme();
  const dimension =
    size === 'sm' ? t.spacing[8] : size === 'lg' ? t.spacing[16] : t.spacing[10];
  const fontSize =
    size === 'sm'
      ? t.typography.sizes.xs
      : size === 'lg'
        ? t.typography.sizes.lg
        : t.typography.sizes.base;

  return (
    <AvatarPrimitive.Root
      alt={alt}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: t.radii.circular,
        backgroundColor: t.colors.surfaceRaised,
        borderWidth: t.borderWidth.thin,
        borderColor: t.colors.border,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <AvatarPrimitive.Image
          source={{ uri: src }}
          style={{ width: dimension, height: dimension }}
        />
      ) : null}
      <AvatarPrimitive.Fallback
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: t.colors.text,
            fontSize: fontSize.fontSize,
            lineHeight: fontSize.lineHeight,
            fontWeight: fontWeight(t, 'semibold'),
          }}
        >
          {fallback}
        </Text>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
