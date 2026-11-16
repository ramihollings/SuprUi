/**
 * Supr UI MCP — component catalog.
 *
 * The 10 Milestone 1 components, exactly as contracted in the repo
 * AGENTS.md. Export names are identical on web (@suprui/ui) and native
 * (@suprui/ui-native). Do not add an 11th component here without a
 * decision in decisions.md.
 *
 * No color, spacing, radius, or duration values appear in this file:
 * usage snippets reference semantic tokens (e.g. `bg-brand`) only.
 */

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  values?: string[];
  description: string;
}

export interface ComponentEntry {
  name: string;
  summary: string;
  props: ComponentProp[];
  web: { importFrom: string; usage: string };
  native: { importFrom: string; usage: string; note?: string };
  notes: string[];
}

export const COMPONENTS: ComponentEntry[] = [
  {
    name: "Button",
    summary: "Primary action control. Five variants, three sizes, optional Lucide icon.",
    props: [
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger"', required: false, values: ["primary", "secondary", "outline", "ghost", "danger"], description: "Visual variant. Default: primary." },
      { name: "size", type: '"sm" | "md" | "lg"', required: false, values: ["sm", "md", "lg"], description: "Control size. Default: md. Prefer sm/md — Supr is a dense workspace." },
      { name: "disabled", type: "boolean", required: false, description: "Disables the button." },
      { name: "children", type: "ReactNode", required: true, description: "Button label." },
      { name: "icon", type: "ReactNode", required: false, description: "Optional Lucide icon rendered before the label." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Button } from "@suprui/ui";\nimport { Plus } from "lucide-react";\n\n<Button variant="primary" size="md" icon={<Plus />}>New item</Button>`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Button } from "@suprui/ui-native";\nimport { Plus } from "lucide-react-native";\n\n<Button variant="primary" size="md" icon={<Plus />}>New item</Button>`,
    },
    notes: [
      "Icon-only buttons must receive an accessible label (e.g. aria-label) from the caller.",
      "Button press uses the snappy spring token on native.",
    ],
  },
  {
    name: "Input",
    summary: "Labelled text field with error and disabled states.",
    props: [
      { name: "label", type: "string", required: false, description: "Field label rendered above the input." },
      { name: "placeholder", type: "string", required: true, description: "Placeholder text." },
      { name: "value", type: "string", required: true, description: "Controlled value." },
      { name: "onChange", type: "(value: string) => void", required: true, description: "Web: change handler. On native this prop is named onChangeText." },
      { name: "error", type: "string", required: false, description: "Error message; renders the error state. The input is still labelled by label." },
      { name: "disabled", type: "boolean", required: false, description: "Disables the field." },
      { name: "size", type: '"sm" | "md" | "lg"', required: false, values: ["sm", "md", "lg"], description: "Control size. Default: md." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Input } from "@suprui/ui";\n\n<Input label="Title" placeholder="Untitled" value={title} onChange={setTitle} error={error} />`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Input } from "@suprui/ui-native";\n\n<Input label="Title" placeholder="Untitled" value={title} onChangeText={setTitle} error={error} />`,
      note: "Native uses onChangeText instead of onChange — the only prop-name difference between platforms.",
    },
    notes: [
      "An input with an error must expose the error to assistive technology.",
    ],
  },
  {
    name: "Dialog",
    summary: "Controlled modal dialog with title, description, content, and footer actions.",
    props: [
      { name: "open", type: "boolean", required: true, description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", required: true, description: "Called when the open state changes." },
      { name: "title", type: "string", required: true, description: "Dialog title." },
      { name: "description", type: "string", required: false, description: "Supporting description under the title." },
      { name: "children", type: "ReactNode", required: true, description: "Dialog body content." },
      { name: "actions", type: "ReactNode", required: false, description: "Footer actions (usually Buttons)." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Dialog, Button } from "@suprui/ui";\n\n<Dialog open={open} onOpenChange={setOpen} title="Delete item?" description="This cannot be undone." actions={<Button variant="danger">Delete</Button>}>\n  <p>The item will be permanently removed.</p>\n</Dialog>`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Dialog, Button } from "@suprui/ui-native";\n\n<Dialog open={open} onOpenChange={setOpen} title="Delete item?" description="This cannot be undone." actions={<Button variant="danger">Delete</Button>}>\n  <p>The item will be permanently removed.</p>\n</Dialog>`,
      note: "Requires a <PortalHost /> from @rn-primitives/portal mounted once at the app root.",
    },
    notes: [
      "Dialog traps focus and returns it on close.",
      "Enter animation uses the slow motion token.",
    ],
  },
  {
    name: "Popover",
    summary: "Controlled floating panel anchored to a trigger element.",
    props: [
      { name: "trigger", type: "ReactNode", required: true, description: "Element that opens the popover." },
      { name: "content", type: "ReactNode", required: true, description: "Popover content." },
      { name: "open", type: "boolean", required: true, description: "Controlled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", required: true, description: "Called when the open state changes." },
      { name: "side", type: '"top" | "bottom" | "left" | "right"', required: false, values: ["top", "bottom", "left", "right"], description: "Preferred placement side." },
      { name: "align", type: '"start" | "center" | "end"', required: false, values: ["start", "center", "end"], description: "Alignment relative to the trigger." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Popover, Button } from "@suprui/ui";\n\n<Popover trigger={<Button variant="ghost">Options</Button>} content={<p>Popover content</p>} open={open} onOpenChange={setOpen} side="bottom" align="start" />`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Popover, Button } from "@suprui/ui-native";\n\n<Popover trigger={<Button variant="ghost">Options</Button>} content={<p>Popover content</p>} open={open} onOpenChange={setOpen} side="bottom" align="start" />`,
      note: "Requires a <PortalHost /> from @rn-primitives/portal mounted once at the app root.",
    },
    notes: ["Enter animation uses the slow motion token."],
  },
  {
    name: "Select",
    summary: "Controlled dropdown select over { label, value } options.",
    props: [
      { name: "options", type: "{ label: string; value: string }[]", required: true, description: "Option list. Do not pass children as options." },
      { name: "value", type: "string", required: true, description: "Controlled selected value." },
      { name: "onValueChange", type: "(value: string) => void", required: true, description: "Called when the selection changes." },
      { name: "placeholder", type: "string", required: false, description: "Placeholder shown when nothing is selected." },
      { name: "label", type: "string", required: false, description: "Field label." },
      { name: "disabled", type: "boolean", required: false, description: "Disables the select." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Select } from "@suprui/ui";\n\n<Select label="Sort by" placeholder="Choose…" options={[{ label: "Newest", value: "newest" }, { label: "Oldest", value: "oldest" }]} value={sort} onValueChange={setSort} />`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Select } from "@suprui/ui-native";\n\n<Select label="Sort by" placeholder="Choose…" options={[{ label: "Newest", value: "newest" }, { label: "Oldest", value: "oldest" }]} value={sort} onValueChange={setSort} />`,
      note: "Requires a <PortalHost /> from @rn-primitives/portal mounted once at the app root.",
    },
    notes: ["Select must expose its state to assistive technology."],
  },
  {
    name: "Tabs",
    summary: "Compound tab set with keyboard navigation. Use the named subcomponents.",
    props: [
      { name: "value", type: "string", required: true, description: "Controlled active tab value (on Tabs)." },
      { name: "onValueChange", type: "(value: string) => void", required: true, description: "Called when the active tab changes (on Tabs)." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@suprui/ui";\n\n<Tabs value={tab} onValueChange={setTab}>\n  <TabsList>\n    <TabsTrigger value="overview">Overview</TabsTrigger>\n    <TabsTrigger value="activity">Activity</TabsTrigger>\n  </TabsList>\n  <TabsContent value="overview">Overview panel</TabsContent>\n  <TabsContent value="activity">Activity panel</TabsContent>\n</Tabs>`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@suprui/ui-native";\n\n<Tabs value={tab} onValueChange={setTab}>\n  <TabsList>\n    <TabsTrigger value="overview">Overview</TabsTrigger>\n    <TabsTrigger value="activity">Activity</TabsTrigger>\n  </TabsList>\n  <TabsContent value="overview">Overview panel</TabsContent>\n  <TabsContent value="activity">Activity panel</TabsContent>\n</Tabs>`,
    },
    notes: [
      "Compound component — use the named subcomponents, not ad-hoc divs/views.",
      "Tabs must support arrow-key navigation on web.",
      "The Tabs indicator uses the snappy spring token.",
    ],
  },
  {
    name: "Toast",
    summary: "Imperative toast notifications. Call toast() and render <Toaster /> once at the app root.",
    props: [
      { name: "title", type: "string", required: true, description: "Toast title (toast() option)." },
      { name: "description", type: "string", required: false, description: "Toast body text (toast() option)." },
      { name: "variant", type: '"default" | "success" | "error" | "warning"', required: false, values: ["default", "success", "error", "warning"], description: "Toast variant (toast() option)." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Toaster, toast } from "@suprui/ui";\n\n// Once at the app root:\n<Toaster />\n\n// Anywhere:\ntoast({ title: "Saved", description: "Your changes are live.", variant: "success" });`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Toaster, toast } from "@suprui/ui-native";\n\n// Once at the app root:\n<Toaster />\n\n// Anywhere:\ntoast({ title: "Saved", description: "Your changes are live.", variant: "success" });`,
    },
    notes: [
      "Toast is imperative — do not render a toast inline.",
      "Danger/success/error/warning variants pair color with an icon and text; color is never the only signal.",
    ],
  },
  {
    name: "Card",
    summary: "Compound content card. Use the named subcomponents.",
    props: [],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@suprui/ui";\n\n<Card>\n  <CardHeader>\n    <CardTitle>Review request</CardTitle>\n    <CardDescription>Waiting on two approvals.</CardDescription>\n  </CardHeader>\n  <CardContent>Card body</CardContent>\n  <CardFooter><Button size="sm">Open</Button></CardFooter>\n</Card>`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@suprui/ui-native";\n\n<Card>\n  <CardHeader>\n    <CardTitle>Review request</CardTitle>\n    <CardDescription>Waiting on two approvals.</CardDescription>\n  </CardHeader>\n  <CardContent>Card body</CardContent>\n  <CardFooter><Button size="sm">Open</Button></CardFooter>\n</Card>`,
    },
    notes: [
      "Compound component — use the named subcomponents, not ad-hoc divs/views.",
      "Cards use the extra-rounded radius token.",
    ],
  },
  {
    name: "Avatar",
    summary: "User/image avatar with a fallback shown when src is absent or fails to load.",
    props: [
      { name: "src", type: "string", required: false, description: "Image URL. Optional — fallback shows when absent." },
      { name: "fallback", type: "string", required: true, description: "Fallback text (e.g. initials) shown when src is absent or fails to load." },
      { name: "size", type: '"sm" | "md" | "lg"', required: false, values: ["sm", "md", "lg"], description: "Avatar size. Default: md." },
      { name: "alt", type: "string", required: true, description: "Accessible description of the person/image." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Avatar } from "@suprui/ui";\n\n<Avatar src="https://example.com/avatar.png" fallback="AK" size="md" alt="Ada K." />`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Avatar } from "@suprui/ui-native";\n\n<Avatar src="https://example.com/avatar.png" fallback="AK" size="md" alt="Ada K." />`,
    },
    notes: ["Avatars use the circular radius token."],
  },
  {
    name: "Switch",
    summary: "Toggle switch with an optional label.",
    props: [
      { name: "checked", type: "boolean", required: true, description: "Controlled checked state." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", required: true, description: "Called when the switch is toggled." },
      { name: "label", type: "string", required: false, description: "Label rendered next to the switch." },
      { name: "disabled", type: "boolean", required: false, description: "Disables the switch." },
    ],
    web: {
      importFrom: "@suprui/ui",
      usage: `import { Switch } from "@suprui/ui";\n\n<Switch checked={enabled} onCheckedChange={setEnabled} label="Notifications" />`,
    },
    native: {
      importFrom: "@suprui/ui-native",
      usage: `import { Switch } from "@suprui/ui-native";\n\n<Switch checked={enabled} onCheckedChange={setEnabled} label="Notifications" />`,
    },
    notes: [
      "Switch must expose its state to assistive technology.",
      "Switch uses the snappy spring token.",
    ],
  },
];

export function getComponent(name: string): ComponentEntry | undefined {
  return COMPONENTS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
