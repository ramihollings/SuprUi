---
title: Input
description: Labelled text input with an error state, in three sizes. Controlled — the value lives in the caller.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | — | Optional label above the field. |
| `placeholder` | `string` | — | |
| `value` | `string` | — | Controlled value (required). |
| `onChange` | `(value: string) => void` | — | **Web only** — receives the new value directly. |
| `onChangeText` | `(text: string) => void` | — | **Native only** — the platform callback. |
| `error` | `string` | — | Error message; renders the error state. |
| `disabled` | `boolean` | — | Non-interactive, reduced opacity. |
| `size` | `sm` \| `md` \| `lg` | `md` | `sm` and `lg` change height and text size. |

On web, `Input` also accepts the standard HTML input attributes except
`size` and `onChange` (which are the component's own).

## Web

```tsx
import { useState } from "react";
import { Input } from "@suprui/ui";

const [name, setName] = useState("");

<Input
  label="Workspace name"
  placeholder="Supr"
  value={name}
  onChange={setName}
/>;

<Input
  label="Email"
  placeholder="you@supr.technology"
  value={email}
  onChange={setEmail}
  error={emailError}
/>;
```

## Native

```tsx
import { useState } from "react";
import { Input } from "@suprui/ui-native";

const [name, setName] = useState("");

<Input
  label="Workspace name"
  placeholder="Supr"
  value={name}
  onChangeText={setName}
/>;
```

## Accessibility

An input with an `error` is still labelled by `label?`, and the error
is exposed to assistive technology (web: `aria-invalid` + the error
message). The error state pairs the danger color with the error text —
never color alone.
