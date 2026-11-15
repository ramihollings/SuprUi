import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Switch } from '../src/components/switch/Switch';

describe('Switch', () => {
  it('reports onCheckedChange on press', async () => {
    const onCheckedChange = vi.fn();
    await render(<Switch checked={false} onCheckedChange={onCheckedChange} label="Sync" />);
    expect(screen.getByText('Sync')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('reflects the checked state to assistive technology', async () => {
    const { rerender } = await render(
      <Switch checked={false} onCheckedChange={() => {}} label="Sync" />,
    );
    expect(screen.getByRole('switch')).toHaveAccessibilityValue({ checked: false });
    await rerender(<Switch checked onCheckedChange={() => {}} label="Sync" />);
    expect(screen.getByRole('switch')).toHaveAccessibilityValue({ checked: true });
  });

  it('does not report when disabled', async () => {
    const onCheckedChange = vi.fn();
    await render(
      <Switch checked={false} onCheckedChange={onCheckedChange} disabled />,
    );
    const element = screen.getByRole('switch');
    expect(element).toBeDisabled();
    await fireEvent.press(element);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
