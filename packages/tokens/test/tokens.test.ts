import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { theme } from '../dist/native/theme.js';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const readDist = (rel: string) => readFileSync(path.join(distDir, rel), 'utf8');
const tokens = JSON.parse(readDist('tokens.json')) as Record<string, any>;
const webCss = readDist('web.css');

describe('@suprui/tokens contract', () => {
  it('cobalt 500 is #1456F0 (Supr brand hex, confirmed from supr.technology)', () => {
    expect(tokens.color.cobalt['500']).toBe('#1456F0');
    expect(webCss).toContain('--color-cobalt-500: #1456F0;');
    expect(webCss).toContain('--color-brand: #1456F0;');
    expect(theme.dark.colors.brand).toBe('#1456F0');
    expect(theme.light.colors.brand).toBe('#1456F0');
  });

  it('dark is the default theme: background #000000, light #FFFFFF', () => {
    expect(theme.dark.colors.background).toBe('#000000');
    expect(theme.light.colors.background).toBe('#FFFFFF');
    expect(tokens.color.semantic.dark.background).toBe('#000000');
    expect(tokens.color.semantic.light.background).toBe('#FFFFFF');
    expect(webCss).toContain('--color-background: #000000;');
    expect(webCss).toContain('[data-theme="light"]');
    expect(webCss).toContain('--color-background: #FFFFFF;');
  });

  it('semantic color sets resolve in both themes', () => {
    expect(theme.dark.colors).toEqual({
      background: '#000000',
      surface: '#0A0A0A',
      surfaceRaised: '#141414',
      border: '#262626',
      borderStrong: '#404040',
      text: '#FFFFFF',
      textMuted: '#A3A3A3',
      brand: '#1456F0',
      brandHover: '#1045C0',
      brandForeground: '#FFFFFF',
      danger: '#EF4444',
      dangerHover: '#B91C1C',
      dangerSolid: '#DC2626',
      success: '#22C55E',
      warning: '#F59E0B',
      track: '#737373',
    });
    expect(theme.light.colors).toEqual({
      background: '#FFFFFF',
      surface: '#F5F5F5',
      surfaceRaised: '#FFFFFF',
      border: '#E5E5E5',
      borderStrong: '#D4D4D4',
      text: '#000000',
      textMuted: '#525252',
      brand: '#1456F0',
      brandHover: '#1045C0',
      brandForeground: '#FFFFFF',
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerSolid: '#DC2626',
      success: '#16A34A',
      warning: '#D97706',
      track: '#737373',
    });
    // focus = brand on web, in both themes; no focus entry in native colors.
    expect(webCss).toContain('--color-focus: #1456F0;');
    expect('focus' in theme.dark.colors).toBe(false);
  });

  it('spacing scale is the 4pt scale (0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64)', () => {
    expect(theme.dark.spacing).toEqual({
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      8: 32,
      10: 40,
      12: 48,
      16: 64,
    });
    expect(theme.light.spacing).toEqual(theme.dark.spacing);
    expect(tokens.spacing['0']).toBe('0px');
    expect(tokens.spacing['16']).toBe('64px');
    expect(webCss).toContain('--spacing-0: 0px;');
    expect(webCss).toContain('--spacing-16: 64px;');
  });

  it('radius values are sharp 0, rounded 8, extra-rounded 16, circular 9999', () => {
    expect(theme.dark.radii).toEqual({ sharp: 0, rounded: 8, extraRounded: 16, circular: 9999 });
    expect(tokens.radius.rounded).toBe('8px');
    expect(tokens.radius.circular).toBe('9999px');
    expect(webCss).toContain('--radius-sharp: 0px;');
    expect(webCss).toContain('--radius-rounded: 8px;');
    expect(webCss).toContain('--radius-extra-rounded: 16px;');
    expect(webCss).toContain('--radius-circular: 9999px;');
  });

  it('border widths are none 0, thin 1, fat 2', () => {
    expect(theme.dark.borderWidth).toEqual({ none: 0, thin: 1, fat: 2 });
    expect(webCss).toContain('--border-none: 0px;');
    expect(webCss).toContain('--border-thin: 1px;');
    expect(webCss).toContain('--border-fat: 2px;');
  });

  it('typography scale and weights resolve', () => {
    expect(theme.dark.typography.sizes.xs).toEqual({ fontSize: 12, lineHeight: 16 });
    expect(theme.dark.typography.sizes['3xl']).toEqual({ fontSize: 30, lineHeight: 36 });
    expect(theme.dark.typography.weights).toEqual({
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    });
    expect(theme.dark.typography.fontFamily).toContain('system-ui');
  });

  it('Supr web font stacks align with the live site without changing native fallback', () => {
    expect(tokens.typography.fontFamilyWeb).toContain('Plus Jakarta Sans');
    expect(tokens.typography.fontFamilyMono).toContain('JetBrains Mono');
    expect(webCss).toContain("--font-sans: 'Plus Jakarta Sans'");
    expect(webCss).toContain("--font-mono: 'JetBrains Mono'");
    expect(theme.dark.typography.fontFamily).toContain('system-ui');
  });

  it('motion durations and springs resolve', () => {
    expect(theme.dark.motion.durationFast).toBe(120);
    expect(theme.dark.motion.durationBase).toBe(200);
    expect(theme.dark.motion.durationSlow).toBe(320);
    expect(theme.dark.motion.springGentle).toEqual({ stiffness: 260, damping: 26 });
    expect(theme.dark.motion.springSnappy).toEqual({ stiffness: 400, damping: 30 });
    expect(webCss).toContain('--motion-duration-fast: 120ms;');
    expect(webCss).toContain('--motion-duration-base: 200ms;');
    expect(webCss).toContain('--motion-duration-slow: 320ms;');
    expect(webCss).toContain('--motion-ease-out: cubic-bezier(0.22, 1, 0.36, 1);');
  });

  it('web.css carries the Tailwind v4 @theme mapping', () => {
    expect(webCss).toContain('@theme inline');
    expect(webCss).toContain('--color-background: var(--color-background);');
    expect(webCss).toContain('--spacing-4: var(--spacing-4);');
    expect(webCss).toContain('--text-base: 16px;');
    expect(webCss).toContain('--text-base--line-height: 24px;');
    // Contrast-audit tokens (2026-11-13): danger-hover + track reach web
    // as utilities (bg-danger-hover, bg-track) via the @theme mapping.
    expect(webCss).toContain('--color-danger-hover: #B91C1C;');
    expect(webCss).toContain('--color-danger-solid: #DC2626;');
    expect(webCss).toContain('--color-track: #737373;');
    expect(webCss).toContain('--color-danger-hover: var(--color-danger-hover);');
    expect(webCss).toContain('--color-danger-solid: var(--color-danger-solid);');
    expect(webCss).toContain('--color-track: var(--color-track);');
  });

  it('all dist files exist after build', () => {
    for (const rel of [
      'web.css',
      'tokens.json',
      'native/theme.ts',
      'native/theme.js',
      'native/theme.d.ts',
    ]) {
      expect(existsSync(path.join(distDir, rel)), `missing dist/${rel}`).toBe(true);
    }
  });
});
