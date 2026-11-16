/**
 * Supr UI demo app — root.
 *
 * Hand-rolled state-stack navigation (no expo-router — see README.md):
 * home lists all 10 components; tapping one opens its showcase screen.
 * Dark is the default theme; the header toggle switches to light.
 *
 * `<PortalHost />` (Dialog / Popover / Select overlays) and `<Toaster />`
 * are mounted once here, at the app root, as @suprui/ui-native requires.
 * All styling comes from the token theme object — no raw values.
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun } from 'lucide-react-native';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider, Toaster, fontWeight, useTheme } from '@suprui/ui-native';
import type { ThemeMode } from '@suprui/ui-native';
import { HomeScreen } from './src/screens/HomeScreen';
import type { ComponentId } from './src/screens/HomeScreen';
import { SHOWCASES } from './src/screens/showcases';

function Header({
  mode,
  onToggleTheme,
}: {
  mode: ThemeMode;
  onToggleTheme: () => void;
}) {
  const t = useTheme();
  const dark = mode === 'dark';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: t.spacing[4],
        paddingVertical: t.spacing[3],
        backgroundColor: t.colors.surface,
        borderBottomWidth: t.borderWidth.thin,
        borderBottomColor: t.colors.border,
      }}
    >
      <Text
        style={{
          color: t.colors.text,
          fontSize: t.typography.sizes.base.fontSize,
          lineHeight: t.typography.sizes.base.lineHeight,
          fontWeight: fontWeight(t, 'semibold'),
        }}
      >
        Supr UI Demo
      </Text>
      <Pressable
        testID="theme-toggle"
        accessibilityRole="button"
        accessibilityLabel={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        onPress={onToggleTheme}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing[2],
          paddingHorizontal: t.spacing[3],
          paddingVertical: t.spacing[2],
          borderRadius: t.radii.circular,
          borderWidth: t.borderWidth.thin,
          borderColor: t.colors.border,
        }}
      >
        {dark ? (
          <Sun size={t.typography.sizes.base.fontSize} color={t.colors.text} />
        ) : (
          <Moon size={t.typography.sizes.base.fontSize} color={t.colors.text} />
        )}
        <Text
          style={{
            color: t.colors.text,
            fontSize: t.typography.sizes.sm.fontSize,
            lineHeight: t.typography.sizes.sm.lineHeight,
            fontWeight: fontWeight(t, 'medium'),
          }}
        >
          {dark ? 'Light' : 'Dark'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [route, setRoute] = useState<ComponentId | 'home'>('home');
  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  const goHome = () => setRoute('home');

  const Screen = route === 'home' ? null : SHOWCASES[route];

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={mode}>
        <PortalHost />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <Header mode={mode} onToggleTheme={toggleTheme} />
          {Screen ? (
            <Screen onBack={goHome} />
          ) : (
            <HomeScreen onSelect={setRoute} />
          )}
        </SafeAreaView>
        <Toaster />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
