/**
 * Supr UI native theme — re-exports the token theme and adds the
 * mode context components consume.
 *
 * Dark is the default. An app opts into light by rendering
 * `<ThemeProvider mode="light">` once at its root; `useTheme()` then
 * returns `theme.light` instead of `theme.dark`. Components never swap
 * hex values themselves — they read `useTheme()` and style from tokens.
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { theme } from '@mrtechnology/tokens/native';
import type {
  SuprTheme,
  Theme,
  ThemeBorderWidth,
  ThemeColors,
  ThemeMotion,
  ThemeRadii,
  ThemeSpacing,
  ThemeSpring,
  ThemeTypography,
} from '@mrtechnology/tokens/native';

export { theme };
export type {
  SuprTheme,
  Theme,
  ThemeBorderWidth,
  ThemeColors,
  ThemeMotion,
  ThemeRadii,
  ThemeSpacing,
  ThemeSpring,
  ThemeTypography,
};

export type ThemeMode = 'dark' | 'light';

const ThemeModeContext = createContext<ThemeMode>('dark');

export function ThemeProvider({
  mode = 'dark',
  children,
}: {
  mode?: ThemeMode;
  children: ReactNode;
}) {
  return (
    <ThemeModeContext.Provider value={mode}>{children}</ThemeModeContext.Provider>
  );
}

/** The active theme mode (`'dark'` by default). */
export function useThemeMode(): ThemeMode {
  return useContext(ThemeModeContext);
}

/**
 * The active token theme: `theme.dark` by default, `theme.light` when the
 * app renders `<ThemeProvider mode="light">`.
 */
export function useTheme(): SuprTheme {
  return theme[useThemeMode()];
}

/**
 * React Native `fontWeight` for a token weight. The token stores the
 * numeric weight (400/500/600/700); RN's type wants the same value as a
 * string literal, so this maps through the token instead of hard-coding
 * the string.
 */
export function fontWeight(
  t: SuprTheme,
  w: keyof SuprTheme['typography']['weights'],
): '400' | '500' | '600' | '700' {
  const n = t.typography.weights[w];
  if (n === 400) return '400';
  if (n === 500) return '500';
  if (n === 600) return '600';
  if (n === 700) return '700';
  throw new Error(`Unsupported token font weight: ${n}`);
}
