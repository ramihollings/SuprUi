---
title: Button
description: Primary action control in five variants and three sizes, with an optional Lucide icon.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `primary` \| `secondary` \| `outline` \| `ghost` \| `danger` | `primary` | |
| `size` | `sm` \| `md` \| `lg` | `md` | Prefer `sm`/`md` — Supr is dense. |
| `disabled` | `boolean` | — | Non-interactive, reduced opacity. |
| `children` | `ReactNode` | — | The label. |
| `icon` | `ReactNode` | — | Optional Lucide icon, rendered before the label. |

On web, `Button` also accepts the standard HTML button attributes
(`onClick`, `type`, …). On native it takes `onPress` instead of
`onClick`, plus `accessibilityLabel` and a forwarded `ref` (needed when
a Button is a Popover trigger via `asChild`).

## Web

```tsx
import { Button } from "@mrtechnology/ui";
import { Plus } from "lucide-react";

<Button variant="primary" onClick={save}>
  Save
</Button>;

<Button variant="secondary" size="sm" icon={<Plus />}>
  New item
</Button>;

<Button variant="danger" onClick={remove}>
  Delete
</Button>;
```

## Native

```tsx
import { Button } from "@mrtechnology/ui-native";
import { Plus } from "lucide-react-native";

<Button variant="primary" onPress={save}>
  Save
</Button>;

<Button variant="secondary" size="sm" icon={<Plus />}>
  New item
</Button>;
```

## Accessibility

Icon-only buttons must have an accessible label — `aria-label` on web,
`accessibilityLabel` on native:

```tsx
// Web
<Button variant="ghost" icon={<Plus />} aria-label="Add item" />;

// Native
<Button variant="ghost" icon={<Plus />} accessibilityLabel="Add item" />;
```

The focus indicator uses `--color-focus`. Press motion uses the token
`snappy` spring.
