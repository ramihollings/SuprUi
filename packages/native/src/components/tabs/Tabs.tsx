/**
 * Tabs — Supr UI native, built on `@rn-primitives/tabs`.
 *
 * Compound: `Tabs` (controlled `value` / `onValueChange`), `TabsList`,
 * `TabsTrigger` (`value`), `TabsContent` (`value`). The active trigger
 * reads the root value through the primitive's context (the wrapper
 * sits inside `Root`, so `useRootContext()` works there) and swaps to
 * the raised-surface token; there is no sliding indicator in M1, so no
 * spring is consumed here (the snappy token spring is reserved for
 * controls that move: Switch thumb, Dialog/Popover scale).
 */
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { fontWeight, useTheme } from '../../theme';

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <TabsPrimitive.List
      style={{
        flexDirection: 'row',
        gap: t.spacing[1],
        backgroundColor: t.colors.surface,
        borderRadius: t.radii.rounded,
        borderWidth: t.borderWidth.thin,
        borderColor: t.colors.border,
        padding: t.spacing[1],
      }}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const t = useTheme();
  const { value: selected } = TabsPrimitive.useRootContext();
  const active = selected === value;
  return (
    <TabsPrimitive.Trigger
      value={value}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: t.spacing[3],
        paddingVertical: t.spacing[2],
        borderRadius: t.radii.rounded,
        backgroundColor: active ? t.colors.surfaceRaised : 'transparent',
      }}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            color: active ? t.colors.text : t.colors.textMuted,
            fontSize: t.typography.sizes.sm.fontSize,
            lineHeight: t.typography.sizes.sm.lineHeight,
            fontWeight: active ? fontWeight(t, 'semibold') : fontWeight(t, 'medium'),
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const t = useTheme();
  return (
    <TabsPrimitive.Content value={value} style={{ paddingTop: t.spacing[3] }}>
      {children}
    </TabsPrimitive.Content>
  );
}
