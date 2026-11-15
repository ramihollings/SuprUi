/**
 * Card — Supr UI native.
 *
 * Compound: `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
 * `CardContent`, `CardFooter`. Panels use the extra-rounded token
 * radius; the header/content/footer spacing comes from the spacing
 * token. No primitive underlies Card — it is layout, not behaviour.
 */
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { fontWeight, useTheme } from '../../theme';

export function Card({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderRadius: t.radii.extraRounded,
        borderWidth: t.borderWidth.thin,
        borderColor: t.colors.border,
        padding: t.spacing[4],
      }}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={{ marginBottom: t.spacing[3] }}>{children}</View>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.colors.text,
        fontSize: t.typography.sizes.lg.fontSize,
        lineHeight: t.typography.sizes.lg.lineHeight,
        fontWeight: fontWeight(t, 'semibold'),
      }}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text
      style={{
        color: t.colors.textMuted,
        fontSize: t.typography.sizes.sm.fontSize,
        lineHeight: t.typography.sizes.sm.lineHeight,
        marginTop: t.spacing[1],
      }}
    >
      {children}
    </Text>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <View>{children}</View>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: t.spacing[2],
        marginTop: t.spacing[4],
      }}
    >
      {children}
    </View>
  );
}
