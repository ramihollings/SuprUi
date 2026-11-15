---
title: Accessibility
description: Every interactive component is keyboard-operable with a visible focus indicator; axe-core clean is the gate, not a warning.
---

Accessibility is a build gate in this system, not a polish pass. A new axe
violation fails the build — fix it, do not suppress it.

## What every component guarantees

- **Keyboard-operable (web)** with a visible focus indicator using
  `--color-focus`. No `outline: none` without a replacement focus style.
- **Icon-only controls must have an accessible label.** On web, pass
  `aria-label` to the `Button`; on native, pass `accessibilityLabel`
  (a required prop pattern for icon-only buttons there).
- **State is exposed.** `Input` with `error?` exposes the error to
  assistive technology; `Switch` and `Select` expose their state;
  `Dialog` traps focus and returns it on close; `Tabs` supports
  arrow-key navigation.
- **Color is never the only signal.** `danger` / `success` / `warning`
  states pair color with text or an icon.
- **Contrast holds in both themes**, dark and light.

## How it is enforced

- **Vitest + axe-core** run automated axe checks for every interactive
  component (Button, Input, Dialog, Popover, Select, Tabs, Switch, plus
  Toast) — zero violations is the gate.
- **Storybook** runs axe in every story via the a11y addon — the
  component workshop is the second check.
- **Playwright** covers web interaction and visual regression.

## Component-specific notes

| Component | Accessibility behavior |
| --- | --- |
| `Button` | Icon-only buttons need `aria-label` (web) / `accessibilityLabel` (native). Disabled state is exposed and non-interactive. |
| `Input` | `error?` renders the error state and message, exposed to assistive tech; the input is still labelled by `label?`. |
| `Dialog` | Focus is trapped while open and returned on close. Controlled via `open` / `onOpenChange`. |
| `Popover` | Controlled via `open` / `onOpenChange`; trigger must be an element (a `Button` is the usual choice). |
| `Select` | Trigger carries `aria-label` from `label` (or the placeholder) so its state is exposed. |
| `Tabs` | Arrow-key navigation is built in (Base UI on web, the primitive on native). |
| `Toast` | Toasts pair color with an icon per variant — never color alone. |
| `Switch` | State is exposed via `aria-checked` (web) / the native switch state. |
| `Avatar` | `alt` describes the person/image; `fallback` is shown when `src` is absent or fails to load. |

## Motion

Respect reduced-motion preferences on web; on native, respect the platform
reduced-motion setting. Motion must never be the only signal for a state
change.
