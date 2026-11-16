---
title: Card
description: Compound content container — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
---

Card is a compound component. Use the named subcomponents — not ad-hoc
divs/views. It is layout only; there is no underlying primitive.

## Subcomponents

| Component | Role |
| --- | --- |
| `Card` | Outer container (`rounded-extra-rounded`, `border-border`, `bg-surface`). |
| `CardHeader` | Header block. |
| `CardTitle` | Card title. |
| `CardDescription` | Supporting text under the title (muted). |
| `CardContent` | Body. |
| `CardFooter` | Footer, e.g. actions. |

## Web

```tsx
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@suprui/ui";

<Card>
  <CardHeader>
    <CardTitle>Workspace</CardTitle>
    <CardDescription>SuprOS — your daily workspace.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card body content.</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary" size="sm">
      Open
    </Button>
  </CardFooter>
</Card>;
```

## Native

```tsx
import { Text } from "react-native";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@suprui/ui-native";

<Card>
  <CardHeader>
    <CardTitle>Workspace</CardTitle>
    <CardDescription>SuprOS — your daily workspace.</CardDescription>
  </CardHeader>
  <CardContent>
    <Text>Card body content.</Text>
  </CardContent>
  <CardFooter>
    <Button variant="secondary" size="sm">
      Open
    </Button>
  </CardFooter>
</Card>;
```

## Notes

Cards use the `extra-rounded` radius (`16px`) — the panel radius, not
the control radius. `CardDescription` uses `--color-text-muted`.
