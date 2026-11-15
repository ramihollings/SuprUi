---
title: Select
description: Controlled dropdown for choosing one option from a list. Options are { label, value } objects — never children.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ label: string; value: string }[]` | — | Options (required). Do not pass children as options. |
| `value` | `string \| null` (web) / `string` (native) | — | Controlled value. |
| `onValueChange` | `(value: string) => void` | — | Called when an option is chosen. |
| `placeholder` | `string` | — | Shown when no value is selected. |
| `label` | `string` | — | Label; also the trigger's accessible name. |
| `disabled` | `boolean` | — | Non-interactive. |

## Web

```tsx
import { useState } from "react";
import { Select } from "@mrtechnology/ui";

const [space, setSpace] = useState<string | null>(null);

<Select
  label="Space"
  placeholder="Choose a space"
  options={[
    { label: "SuprOS", value: "os" },
    { label: "SuprCMS", value: "cms" },
    { label: "SuprInbox", value: "inbox" },
  ]}
  value={space}
  onValueChange={setSpace}
/>;
```

## Native

```tsx
import { useState } from "react";
import { Select } from "@mrtechnology/ui-native";

const [space, setSpace] = useState("");

<Select
  label="Space"
  placeholder="Choose a space"
  options={[
    { label: "SuprOS", value: "os" },
    { label: "SuprCMS", value: "cms" },
    { label: "SuprInbox", value: "inbox" },
  ]}
  value={space}
  onValueChange={setSpace}
/>;
```

Native requires a `<PortalHost />` from `@rn-primitives/portal` mounted
once at the app root.

## Notes

- The one deliberate API difference between platforms: web `value` is
  `string | null` (no selection is `null`); native `value` is `string`.
- The trigger carries `aria-label` from `label` (or the placeholder) so
  its state is exposed to assistive technology.
