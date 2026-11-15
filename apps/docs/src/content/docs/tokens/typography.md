---
title: Typography
description: The Supr type scale — seven sizes with paired line heights, four weights, and a system font stack with no webfont dependency.
---

## Type scale

Each step is a font-size / line-height pair. Web: the `text-xs` …
`text-3xl` utilities carry the paired line height automatically.

| Step | Token | Font size | Line height |
| --- | --- | --- | --- |
| `xs` | `--font-size-xs` / `--line-height-xs` | `12px` | `16px` |
| `sm` | `--font-size-sm` / `--line-height-sm` | `14px` | `20px` |
| `base` | `--font-size-base` / `--line-height-base` | `16px` | `24px` |
| `lg` | `--font-size-lg` / `--line-height-lg` | `18px` | `28px` |
| `xl` | `--font-size-xl` / `--line-height-xl` | `20px` | `28px` |
| `2xl` | `--font-size-2xl` / `--line-height-2xl` | `24px` | `32px` |
| `3xl` | `--font-size-3xl` / `--line-height-3xl` | `30px` | `36px` |

## Weights

| Token | Value |
| --- | --- |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

Web: `font-regular`, `font-medium`, `font-semibold`, `font-bold`.
Native: `theme.typography` carries the same sizes, line heights, and
weights.

## Font family

A system stack — no webfont dependency:

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

Web: `font-sans`. Native: the `fontFamily` token is a web stack string
and is **not usable as a React Native font family** — native components
use the platform system font.

## Usage

```tsx
// Web
<h1 className="text-3xl font-semibold text-text">Title</h1>
<p className="text-sm text-text-muted">Secondary copy.</p>
```
