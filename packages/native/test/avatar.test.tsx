import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { Avatar } from '../src/components/avatar/Avatar';

describe('Avatar', () => {
  it('shows the fallback when there is no src', async () => {
    await render(<Avatar fallback="JD" alt="Jane Doe" />);
    expect(screen.getByText('JD')).toBeOnTheScreen();
  });

  it('shows the fallback at every size', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = await render(<Avatar fallback="AB" size={size} alt="A B" />);
      expect(screen.getByText('AB')).toBeOnTheScreen();
      await unmount();
    }
  });

  it('takes the image path when a src is given (fallback leaves the tree)', async () => {
    await render(<Avatar src="https://example.com/avatar.png" fallback="JD" alt="Jane Doe" />);
    // The primitive hides the fallback once the image reports loading;
    // effects are flushed by the async render, so the fallback is gone.
    expect(screen.queryByText('JD')).not.toBeOnTheScreen();
  });
});
