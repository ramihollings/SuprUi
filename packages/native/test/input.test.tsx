import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Input } from '../src/components/input/Input';

describe('Input', () => {
  it('renders the label and placeholder, and reports text changes', async () => {
    const onChangeText = vi.fn();
    await render(
      <Input label="Name" placeholder="Type your name" value="" onChangeText={onChangeText} />,
    );
    expect(screen.getByText('Name')).toBeOnTheScreen();
    // The field is labelled by `label`; the placeholder is a prop on
    // the host input. (RNTL's getByPlaceholderText only matches a host
    // named exactly `TextInput`; on Android the host is
    // `AndroidTextInput`, so the label query is the working query here.
    // See the README's test-notes section.)
    const field = screen.getByLabelText('Name');
    expect(field).toHaveProp('placeholder', 'Type your name');
    await fireEvent.changeText(field, 'Ada');
    expect(onChangeText).toHaveBeenCalledWith('Ada');
  });

  it('renders the error message and marks the field', async () => {
    await render(
      <Input label="Email" value="not-an-email" onChangeText={() => {}} error="Enter a valid email" />,
    );
    expect(screen.getByText('Enter a valid email')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });

  it('renders every size and is disabled when asked', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = await render(
        <Input size={size} placeholder={`input-${size}`} value="" onChangeText={() => {}} />,
      );
      // No label here, so the field is labelled by its placeholder.
      expect(screen.getByLabelText(`input-${size}`)).toBeOnTheScreen();
      await unmount();
    }
    await render(
      <Input placeholder="off" value="" onChangeText={() => {}} disabled />,
    );
    expect(screen.getByLabelText('off')).toBeDisabled();
  });
});
