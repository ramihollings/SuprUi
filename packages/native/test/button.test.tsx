import { describe, expect, it, vi } from 'vitest';
import { Check } from 'lucide-react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/components/button/Button';

describe('Button', () => {
  it('renders children in every variant', async () => {
    for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const) {
      const { unmount } = await render(<Button variant={variant}>{`Go ${variant}`}</Button>);
      expect(screen.getByText(`Go ${variant}`)).toBeOnTheScreen();
      await unmount();
    }
  });

  it('renders every size', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = await render(<Button size={size}>{`Size ${size}`}</Button>);
      expect(screen.getByText(`Size ${size}`)).toBeOnTheScreen();
      await unmount();
    }
  });

  it('calls onPress when pressed', async () => {
    const onPress = vi.fn();
    await render(<Button onPress={onPress}>Tap me</Button>);
    await fireEvent.press(screen.getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = vi.fn();
    await render(
      <Button disabled onPress={onPress}>
        Tap me
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a Lucide icon alongside the label', async () => {
    await render(
      <Button icon={<Check />}>
        Save
      </Button>,
    );
    expect(screen.getByText('Save')).toBeOnTheScreen();
  });
});
