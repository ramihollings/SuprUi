---
title: Toast
description: Imperative toast notifications — call toast() anywhere, render <Toaster /> once at the app root.
---

Toast is imperative: call `toast({ title, description, variant })` and
render `<Toaster />` once at the app root. Do not render a toast inline.

## API

```ts
toast({ title, description?, variant? });
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | — | Required. |
| `description` | `string` | — | Optional supporting text. |
| `variant` | `default` \| `success` \| `error` \| `warning` | `default` | Each variant pairs its color with an icon — never color alone. |

## Web

```tsx
import { Button, Toaster, toast } from "@mrtechnology/ui";

function App() {
  return (
    <>
      <Toaster />
      <Button
        variant="primary"
        onClick={() => toast({ title: "Saved", variant: "success" })}
      >
        Save
      </Button>
    </>
  );
}
```

## Native

```tsx
import { Button, Toaster, toast } from "@mrtechnology/ui-native";

function App() {
  return (
    <>
      <Toaster />
      <Button
        variant="primary"
        onPress={() => toast({ title: "Saved", variant: "success" })}
      >
        Save
      </Button>
    </>
  );
}
```

## Notes

- **Native returns an id:** native `toast()` returns a numeric id, and
  `dismissToast(id)` dismisses that toast programmatically. Web
  `toast()` returns nothing.
- **Native auto-dismiss:** native toasts auto-dismiss after 4000 ms.
  That lifetime has **no token** — the token set defines motion
  durations, not a toast lifetime.
