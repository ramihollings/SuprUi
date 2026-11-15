/**
 * Shared showcase shell + themed style helpers for the demo app.
 *
 * Every style value comes from the token theme object (`useTheme()`):
 * colors, spacing steps, radii, border widths, type sizes, weights.
 * No raw hex, no literal pixel value, no literal duration appears here
 * (or anywhere in the demo app) — `flex: 1` is a unitless layout value,
 * not a size.
 */
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { fontWeight, useTheme } from '@mrtechnology/ui-native';
import type { SuprTheme } from '@mrtechnology/ui-native';

export function useDemoStyles() {
  const t = useTheme();
  return {
    t,
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      padding: t.spacing[4],
      paddingBottom: t.spacing[8],
      gap: t.spacing[4],
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: t.spacing[2],
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
      borderBottomWidth: t.borderWidth.thin,
      borderBottomColor: t.colors.border,
      backgroundColor: t.colors.surface,
    },
    title: {
      color: t.colors.text,
      fontSize: t.typography.sizes.xl.fontSize,
      lineHeight: t.typography.sizes.xl.lineHeight,
      fontWeight: fontWeight(t, 'semibold'),
    },
    heading: {
      color: t.colors.text,
      fontSize: t.typography.sizes.lg.fontSize,
      lineHeight: t.typography.sizes.lg.lineHeight,
      fontWeight: fontWeight(t, 'semibold'),
    },
    body: {
      color: t.colors.text,
      fontSize: t.typography.sizes.base.fontSize,
      lineHeight: t.typography.sizes.base.lineHeight,
    },
    muted: {
      color: t.colors.textMuted,
      fontSize: t.typography.sizes.sm.fontSize,
      lineHeight: t.typography.sizes.sm.lineHeight,
    },
    section: {
      gap: t.spacing[2],
    },
    row: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: t.spacing[2],
      alignItems: 'center' as const,
    },
    backLabel: {
      color: t.colors.brand,
      fontSize: t.typography.sizes.base.fontSize,
      lineHeight: t.typography.sizes.base.lineHeight,
      fontWeight: fontWeight(t, 'medium'),
    },
  };
}

export type DemoStyles = ReturnType<typeof useDemoStyles>;

export function sectionLabelStyle(t: SuprTheme) {
  return {
    color: t.colors.textMuted,
    fontSize: t.typography.sizes.sm.fontSize,
    lineHeight: t.typography.sizes.sm.lineHeight,
    fontWeight: fontWeight(t, 'semibold'),
  };
}

export interface ScreenShellProps {
  /** Navigation-contract testID, e.g. `screen-button`. */
  testID: string;
  title: string;
  description: string;
  onBack: () => void;
  children: ReactNode;
}

/**
 * Showcase screen shell: a back button, the component name, a one-line
 * description, and a scrolling content area. The root View carries the
 * contract testID.
 */
export function ScreenShell({ testID, title, description, onBack, children }: ScreenShellProps) {
  const s = useDemoStyles();
  return (
    <View testID={testID} style={s.root}>
      <View style={s.header}>
        <Pressable
          testID="nav-back"
          accessibilityRole="button"
          accessibilityLabel="Back to component list"
          onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center', gap: s.t.spacing[1] }}
        >
          <ChevronLeft size={s.t.typography.sizes.base.fontSize} color={s.t.colors.brand} />
          <Text style={s.backLabel}>All components</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.muted}>{description}</Text>
        {children}
      </ScrollView>
    </View>
  );
}
