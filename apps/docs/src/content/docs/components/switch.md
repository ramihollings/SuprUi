---
title: Switch
description: Binary on/off control with an optional label. State is exposed to assistive technology.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Controlled state (required). |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called when toggled. |
| `label` | `string` | — | Optional label next to the switch. |
| `disabled` | `boolean` | — | Non-interactive. |

## Web

```tsx
import { useState } from "react";
import { Switch } from "@mrtechnology/ui";

const [enabled, setEnabled] = useState(false);

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Email notifications"
/>;
```

## Native

```tsx
import { useState } from "react";
import { Switch } from "@mrtechnology/ui-native";

const [enabled, setEnabled] = useState(false);

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Email notifications"
/>;
```

## Accessibility

State is exposed via `aria-checked` (Base UI on web) and the native
switch state. The thumb motion uses the token `snappy` spring. As with
every control, the checked state is signalled by position as well as
color — never color alone.
