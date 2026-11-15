import { PortalHost } from '@rn-primitives/portal';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

/**
 * Render with a PortalHost mounted: Dialog, Popover and Select render
 * their content into a portal, which has nowhere to mount without one.
 * (Consumers must mount `<PortalHost />` once at the app root too.)
 */
export async function renderWithPortal(ui: ReactElement) {
  return render(
    <>
      <PortalHost />
      {ui}
    </>,
  );
}
