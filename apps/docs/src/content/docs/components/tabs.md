---
title: Tabs
description: Compound tab navigation with arrow-key support — Tabs, TabsList, TabsTrigger, TabsContent.
---

Tabs is a compound component. Use the named subcomponents — `Tabs`,
`TabsList`, `TabsTrigger`, `TabsContent` — not ad-hoc divs/views.

## Props

| Component | Props |
| --- | --- |
| `Tabs` | `value: string`, `onValueChange: (value: string) => void`, `children` |
| `TabsList` | `children` |
| `TabsTrigger` | `value: string`, `children` |
| `TabsContent` | `value: string`, `children` |

On web, `Tabs` also accepts `className`.

## Web

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mrtechnology/ui";

const [tab, setTab] = useState("overview");

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview panel.</TabsContent>
  <TabsContent value="activity">Activity panel.</TabsContent>
  <TabsContent value="settings">Settings panel.</TabsContent>
</Tabs>;
```

## Native

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mrtechnology/ui-native";

const [tab, setTab] = useState("overview");

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview panel.</TabsContent>
  <TabsContent value="activity">Activity panel.</TabsContent>
  <TabsContent value="settings">Settings panel.</TabsContent>
</Tabs>;
```

## Accessibility

Arrow-key navigation between triggers is built in (Base UI on web, the
primitive on native). The Tabs indicator motion uses the token `snappy`
spring.
