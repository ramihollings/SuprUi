---
title: Avatar
description: Circular person/image avatar with a fallback shown when the image is absent or fails to load.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | — | Image URL (optional). |
| `fallback` | `string` | — | Shown when `src` is absent or fails to load (required). |
| `size` | `sm` \| `md` \| `lg` | `md` | |
| `alt` | `string` | — | Describes the person/image (required). |

## Web

```tsx
import { Avatar } from "@suprui/ui";

<Avatar
  src="https://example.com/ada.jpg"
  fallback="AL"
  alt="Ada Lovelace"
/>;

<Avatar fallback="TS" size="sm" alt="Tibo Sottiaux" />;
```

## Native

```tsx
import { Avatar } from "@suprui/ui-native";

<Avatar
  src="https://example.com/ada.jpg"
  fallback="AL"
  alt="Ada Lovelace"
/>;

<Avatar fallback="TS" size="sm" alt="Tibo Sottiaux" />;
```

## Notes

- Avatars use the `circular` radius — the only radius for avatars and
  pills.
- The fallback background is `--color-brand` with
  `--color-brand-foreground` text.
- Sizes map to spacing steps: web `sm`/`md`/`lg` render at the `8`/`10`/`12`
  steps; native at the `8`/`10`/`16` steps.
