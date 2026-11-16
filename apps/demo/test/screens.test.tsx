/**
 * Demo-app smoke tests: the harness renders, and a showcase screen
 * renders with its contract testID. (The Select option-press retry lives
 * in select-press.test.tsx — skipped, see there.)
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ThemeProvider } from '@suprui/ui-native';
import { ButtonScreen } from '../src/screens/showcases';

describe('demo screens', () => {
  it('renders a bare view', async () => {
    await render(
      <View>
        <Text>probe</Text>
      </View>,
    );
    expect(screen.getByText('probe')).toBeOnTheScreen();
  });

  it('renders the Button showcase', async () => {
    await render(
      <ThemeProvider mode="dark">
        <ButtonScreen onBack={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('screen-button')).toBeOnTheScreen();
  });
});
