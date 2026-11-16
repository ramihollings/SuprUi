import { describe, expect, it } from 'vitest';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider, fontWeight, theme, useTheme } from '../src/theme';

describe('@suprui/tokens/native resolves in @suprui/ui-native', () => {
  it('theme.dark is the default: black background, cobalt brand #1456F0', () => {
    expect(theme.dark.colors.background).toBe('#000000');
    expect(theme.dark.colors.brand).toBe('#1456F0');
    // Contrast audit 2026-11-13: dark brand-hover is cobalt-600 #1045C0 in
    // both themes — white text on the old cobalt-400 #4378F3 was 4.02:1,
    // below AA 4.5:1.
    expect(theme.dark.colors.brandHover).toBe('#1045C0');
    expect(theme.light.colors.background).toBe('#FFFFFF');
    expect(theme.light.colors.brandHover).toBe('#1045C0');
    // Contrast-audit tokens: danger-solid is the filled danger Button bg,
    // danger-hover its hover/pressed bg, track the unchecked Switch track.
    expect(theme.dark.colors.danger).toBe('#EF4444');
    expect(theme.dark.colors.dangerSolid).toBe('#DC2626');
    expect(theme.dark.colors.dangerHover).toBe('#B91C1C');
    expect(theme.dark.colors.track).toBe('#737373');
    expect(theme.light.colors.dangerSolid).toBe('#DC2626');
    expect(theme.light.colors.dangerHover).toBe('#B91C1C');
    expect(theme.light.colors.track).toBe('#737373');
  });

  it('motion tokens match the contract', () => {
    expect(theme.dark.motion.durationFast).toBe(120);
    expect(theme.dark.motion.durationBase).toBe(200);
    expect(theme.dark.motion.durationSlow).toBe(320);
    expect(theme.dark.motion.springGentle).toEqual({ stiffness: 260, damping: 26 });
    expect(theme.dark.motion.springSnappy).toEqual({ stiffness: 400, damping: 30 });
  });

  it('the native theme has no focus colour (web-only token)', () => {
    expect('focus' in theme.dark.colors).toBe(false);
    expect('focus' in theme.light.colors).toBe(false);
  });

  it('spacing / radii / border widths are the token scales', () => {
    expect(theme.dark.spacing).toEqual({
      0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
    });
    expect(theme.dark.radii).toEqual({ sharp: 0, rounded: 8, extraRounded: 16, circular: 9999 });
    expect(theme.dark.borderWidth).toEqual({ none: 0, thin: 1, fat: 2 });
  });
});

function Probe() {
  const t = useTheme();
  return <Text testID="probe">{t.colors.background}</Text>;
}

describe('useTheme() / ThemeProvider', () => {
  it('returns theme.dark by default', async () => {
    await render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('#000000');
  });

  it('returns theme.light when the app opts in via ThemeProvider', async () => {
    await render(
      <ThemeProvider mode="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('#FFFFFF');
  });

  it('fontWeight maps token weights to RN font-weight strings', () => {
    expect(fontWeight(theme.dark, 'regular')).toBe('400');
    expect(fontWeight(theme.dark, 'medium')).toBe('500');
    expect(fontWeight(theme.dark, 'semibold')).toBe('600');
    expect(fontWeight(theme.dark, 'bold')).toBe('700');
  });
});
