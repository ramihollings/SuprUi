---
title: Popover
description: Controlled floating panel anchored to a trigger element — for menus, pickers, and small contextual surfaces.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `trigger` | `ReactNode` | — | The element that opens the popover (a `Button` is the usual choice). |
| `content` | `ReactNode` | — | Popover body. |
| `open` | `boolean` | — | Controlled open state (required). |
| `onOpenChange` | `(open: boolean) => void` | — | Called on open and close. |
| `side` | `top` \| `bottom` \| `left` \| `right` | — | Preferred placement. |
| `align` | `start` \| `center` \| `end` | — | Alignment to the trigger. |

## Web

```tsx
import { useState } from "react";
import { Button, Popover } from "@mrtechnology/ui";

const [open, setOpen] = useState(false);

<Popover
  trigger={<Button variant="outline">Filters</Button>}
  content={<p>Filter controls go here.</p>}
  open={open}
  onOpenChange={setOpen}
  side="bottom"
  align="start"
/>;
```

## Native

```tsx
import { useState } from "react";
import { Text } from "react-native";
import { Button, Popover } from "@mrtechnology/ui-native";

const [open, setOpen] = useState(false);

<Popover
  trigger={<Button variant="outline">Filters</Button>}
  content={<Text>Filter controls go here.</Text>}
  open={open}
  onOpenChange={setOpen}
  side="bottom"
  align="start"
/>;
```

Native requires a `<PortalHost />` from `@rn-primitives/portal` mounted
once at the app root.

## Notes

- The trigger must be an element; plain text is wrapped in a span.
- **Native placement limit:** `side="left" | "right"` are accepted for web
  parity but fall back to `"bottom"` — the underlying primitive natively
  supports only top/bottom.
- The enter transition uses the token `slow` duration.
