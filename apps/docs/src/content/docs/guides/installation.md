---
title: Installation
description: Install Supr UI for web (React) or Android (React Native), and wire up the tokens once at the app root.
---

## Web

```bash
npm install @suprui/ui @suprui/tokens
```

Peer dependencies: `react ^19`, `react-dom ^19`. Runtime dependencies ship
with the package: `@base-ui/react`, `lucide-react`, `motion`,
`class-variance-authority`, `clsx`, `tailwind-merge`.

Import the stylesheet once, at the app root. It pulls in Tailwind v4 and the
token CSS variables, and maps tokens to utilities (`bg-background`,
`text-text-muted`, `border-border`, `bg-brand`, `rounded-rounded`, …).

```css
/* src/index.css */
@import "@suprui/ui/styles.css";
```

If you use PostCSS, this package ships a `postcss.config.json` wiring
`@tailwindcss/postcss`; `@tailwindcss/vite` works the same way for
Vite-based apps — the CSS itself is identical.

If your app does not use Tailwind, import the token variables directly
instead — the components' classes still resolve through them:

```css
@import "@suprui/tokens/web.css";
```

## Android (React Native)

```bash
npm install @suprui/ui-native @suprui/tokens
```

Peer dependencies (installed by the consuming app): `react ^19`,
`react-native ^0.82`, `nativewind ^4.2.7`, `react-native-reanimated 4.3.x`,
`react-native-worklets 0.8.x`, `tailwindcss ^3.4.0`.

```tsx
import { ThemeProvider, Button, Input, Toaster, toast } from "@suprui/ui-native";
import { PortalHost } from "@rn-primitives/portal";

export default function App() {
  return (
    <ThemeProvider mode="dark">
      <PortalHost />
      <Button variant="primary" onPress={() => toast({ title: "Saved" })}>
        Save
      </Button>
      <Toaster />
    </ThemeProvider>
  );
}
```

Two root mounts are required:

- **`<PortalHost />`** (from `@rn-primitives/portal`), once at the app root.
  `Dialog`, `Popover`, and `Select` render their overlay content into a
  portal — without it, their content has nowhere to mount.
- **`<Toaster />`**, once at the app root, for the imperative `toast()` API.

### NativeWind setup (consumer screens)

The components style themselves from the token theme object (`useTheme()`),
not from NativeWind classes — deliberate, because NativeWind's CSS variables
are static at build time and there is no `data-theme` equivalent on React
Native, so class-based colors cannot switch dark/light at runtime. The
theme object can.

`global.css` and `tailwind.config.js` are still shipped for **consumer
screens** that want the same token utilities (`bg-background`,
`text-text-muted`, `border-border`, `bg-brand`, `rounded-rounded`, …).
Note those utilities always resolve to the dark token set — runtime
light/dark switching belongs to the components, not to the classes.

Setup in the consuming app (bare React Native; Expo differs only in the
Metro wrapper):

```js
// babel.config.js
module.exports = {
  presets: [
    ["module:metro-react-native-babel-preset", { jsxImportSource: "nativewind" }],
  ],
  plugins: ["nativewind/babel"],
};
// metro.config.js
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./global.css" });
```

```tsx
// App entry point
import "@suprui/ui-native/global.css";
```

Copy `tailwind.config.js` from the package into the app (or merge its
`theme.extend` into the app's own config) and point its `content` at the
app's source.

## What you get

Both packages export the same 10 components with the same names:
`Button`, `Input`, `Dialog`, `Popover`, `Select`, `Tabs`, `Toast` (plus
`Toaster`), `Card`, `Avatar`, `Switch`. Every component page in these docs
shows the web and native usage side by side — the only deliberate API
differences are the platform ones (`onChange` vs `onChangeText` on `Input`,
`onClick` vs `onPress` on `Button`, `string | null` vs `string` for
`Select`'s `value`), and they are called out on each page.
