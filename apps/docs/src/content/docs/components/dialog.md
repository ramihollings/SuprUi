---
title: Dialog
description: Controlled modal dialog with a title, optional description, body content, and footer actions. Focus is trapped while open.
---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Controlled open state (required). |
| `onOpenChange` | `(open: boolean) => void` | — | Called on open and close. |
| `title` | `string` | — | Dialog title (required). |
| `description` | `string` | — | Optional supporting text. |
| `children` | `ReactNode` | — | Dialog body. |
| `actions` | `ReactNode` | — | Footer actions, e.g. a cancel + confirm `Button` pair. |

## Web

```tsx
import { useState } from "react";
import { Button, Dialog } from "@mrtechnology/ui";

const [open, setOpen] = useState(false);

<Button variant="primary" onClick={() => setOpen(true)}>
  Delete workspace
</Button>;

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Delete workspace?"
  description="This permanently deletes the workspace and its contents."
  actions={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={confirmDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>Workspaces cannot be recovered after deletion.</p>
</Dialog>;
```

## Native

```tsx
import { useState } from "react";
import { Text } from "react-native";
import { Button, Dialog } from "@mrtechnology/ui-native";

const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Delete workspace?"
  description="This permanently deletes the workspace and its contents."
  actions={
    <>
      <Button variant="ghost" onPress={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onPress={confirmDelete}>
        Delete
      </Button>
    </>
  }
>
  <Text>Workspaces cannot be recovered after deletion.</Text>
</Dialog>;
```

Native requires a `<PortalHost />` from `@rn-primitives/portal` mounted
once at the app root — the dialog content renders into the portal.

## Accessibility

Focus is trapped while the dialog is open and returned to the trigger
on close (Base UI on web, the primitive on native). The enter transition
uses the token `slow` duration. The scrim is the background token at
reduced opacity — there is no separate scrim token.
