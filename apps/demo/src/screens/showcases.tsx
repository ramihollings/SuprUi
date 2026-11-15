/**
 * Showcase screens — one per component, each interactive (not static).
 *
 * Navigation contract: each screen's root View carries
 * `screen-<component>` in lowercase. Every screen is a live instance of
 * the real @mrtechnology/ui-native component with working state.
 */
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  Input,
  Popover,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  fontWeight,
  toast,
} from '@mrtechnology/ui-native';
import { ScreenShell, sectionLabelStyle, useDemoStyles } from '../screen-shell';
import type { ComponentId } from './HomeScreen';

export interface ShowcaseProps {
  onBack: () => void;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  const s = useDemoStyles();
  return (
    <View style={s.section}>
      <Text style={sectionLabelStyle(s.t)}>{label}</Text>
      {children}
    </View>
  );
}

export function ButtonScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [count, setCount] = useState(0);
  return (
    <ScreenShell
      testID="screen-button"
      title="Button"
      description="Five variants, three sizes, disabled state. Pressing counts."
      onBack={onBack}
    >
      <Section label="Variants">
        <View style={s.row}>
          <Button variant="primary" onPress={() => setCount((n) => n + 1)}>
            Primary
          </Button>
          <Button variant="secondary" onPress={() => setCount((n) => n + 1)}>
            Secondary
          </Button>
          <Button variant="outline" onPress={() => setCount((n) => n + 1)}>
            Outline
          </Button>
          <Button variant="ghost" onPress={() => setCount((n) => n + 1)}>
            Ghost
          </Button>
          <Button variant="danger" onPress={() => setCount((n) => n + 1)}>
            Danger
          </Button>
        </View>
      </Section>
      <Section label="Sizes">
        <View style={s.row}>
          <Button size="sm" onPress={() => setCount((n) => n + 1)}>
            Small
          </Button>
          <Button size="md" onPress={() => setCount((n) => n + 1)}>
            Medium
          </Button>
          <Button size="lg" onPress={() => setCount((n) => n + 1)}>
            Large
          </Button>
        </View>
      </Section>
      <Section label="With icons / disabled">
        <View style={s.row}>
          <Button
            icon={<Plus size={s.t.typography.sizes.base.fontSize} color={s.t.colors.brandForeground} />}
            onPress={() => setCount((n) => n + 1)}
          >
            Add item
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 size={s.t.typography.sizes.base.fontSize} color={s.t.colors.brandForeground} />}
            onPress={() => setCount((n) => n + 1)}
          >
            Delete
          </Button>
          <Button disabled onPress={() => setCount((n) => n + 1)}>
            Disabled
          </Button>
        </View>
      </Section>
      <Text testID="button-press-count" style={s.body}>
        Pressed {count} {count === 1 ? 'time' : 'times'}
      </Text>
    </ScreenShell>
  );
}

export function InputScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [value, setValue] = useState('');
  const error = value.length > 0 && value.length < 3 ? 'Keep typing — at least 3 characters' : undefined;
  return (
    <ScreenShell
      testID="screen-input"
      title="Input"
      description="Controlled text input. An error appears while the value is 1–2 characters."
      onBack={onBack}
    >
      <Input
        label="Workspace name"
        placeholder="e.g. Supr HQ"
        value={value}
        onChangeText={setValue}
        error={error}
      />
      <Input label="Disabled" placeholder="Cannot type here" value="" onChangeText={() => {}} disabled />
      <Text testID="input-echo" style={s.body}>
        You typed: {value === '' ? '—' : value}
      </Text>
    </ScreenShell>
  );
}

export function DialogScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(0);
  return (
    <ScreenShell
      testID="screen-dialog"
      title="Dialog"
      description="Controlled dialog with actions. Confirming counts and closes."
      onBack={onBack}
    >
      <Button variant="primary" onPress={() => setOpen(true)}>
        Open dialog
      </Button>
      <Text testID="dialog-confirm-count" style={s.body}>
        Confirmed {confirmed} {confirmed === 1 ? 'time' : 'times'}
      </Text>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Publish workspace?"
        description="This makes the workspace visible to everyone in your org."
        actions={
          <View style={s.row}>
            <Button variant="outline" onPress={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={() => {
                setConfirmed((n) => n + 1);
                setOpen(false);
              }}
            >
              Publish
            </Button>
          </View>
        }
      >
        <Text style={s.body}>Publishing cannot be undone from the mobile app.</Text>
      </Dialog>
    </ScreenShell>
  );
}

export function PopoverScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('Nothing picked yet');
  return (
    <ScreenShell
      testID="screen-popover"
      title="Popover"
      description="Controlled popover. Pick an option inside it to close it."
      onBack={onBack}
    >
      <Popover
        open={open}
        onOpenChange={setOpen}
        side="bottom"
        align="center"
        trigger={<Button variant="outline">Open popover</Button>}
        content={
          <View style={{ gap: s.t.spacing[2] }}>
            <Text style={{ ...s.body, fontWeight: fontWeight(s.t, 'semibold') }}>Quick actions</Text>
            <Button
              variant="ghost"
              onPress={() => {
                setPicked('Picked: Duplicate');
                setOpen(false);
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                setPicked('Picked: Archive');
                setOpen(false);
              }}
            >
              Archive
            </Button>
          </View>
        }
      />
      <Text testID="popover-picked" style={s.body}>
        {picked}
      </Text>
    </ScreenShell>
  );
}

const SELECT_OPTIONS = [
  { label: 'Cobalt', value: 'cobalt' },
  { label: 'Black', value: 'black' },
  { label: 'Paper', value: 'paper' },
];

export function SelectScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [value, setValue] = useState('cobalt');
  const selected = SELECT_OPTIONS.find((o) => o.value === value);
  return (
    <ScreenShell
      testID="screen-select"
      title="Select"
      description="Controlled select. Opening the list and picking an option updates the value below."
      onBack={onBack}
    >
      <Select
        options={SELECT_OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Pick a colour"
        label="Theme colour"
      />
      <Text testID="select-value" style={s.body}>
        Selected: {selected ? selected.label : 'none'}
      </Text>
    </ScreenShell>
  );
}

export function TabsScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [value, setValue] = useState('overview');
  return (
    <ScreenShell
      testID="screen-tabs"
      title="Tabs"
      description="Compound tabs. Switching tabs swaps the content panel."
      onBack={onBack}
    >
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Text style={s.body}>Overview: your workspace at a glance.</Text>
        </TabsContent>
        <TabsContent value="details">
          <Text style={s.body}>Details: members, activity, and storage.</Text>
        </TabsContent>
        <TabsContent value="settings">
          <Text style={s.body}>Settings: billing, permissions, and danger zone.</Text>
        </TabsContent>
      </Tabs>
      <Text testID="tabs-value" style={s.body}>
        Active tab: {value}
      </Text>
    </ScreenShell>
  );
}

export function ToastScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  return (
    <ScreenShell
      testID="screen-toast"
      title="Toast"
      description="Imperative toasts — one button per variant. Each toast auto-dismisses."
      onBack={onBack}
    >
      <View style={s.row}>
        <Button
          variant="primary"
          onPress={() => toast({ title: 'Saved', description: 'Your changes are saved.' })}
        >
          Default
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            toast({ title: 'Published', description: 'The page is live.', variant: 'success' })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            toast({ title: 'Something failed', description: 'Try again.', variant: 'error' })
          }
        >
          Error
        </Button>
        <Button
          variant="ghost"
          onPress={() =>
            toast({ title: 'Heads up', description: 'Storage is almost full.', variant: 'warning' })
          }
        >
          Warning
        </Button>
      </View>
      <Text style={s.muted}>Toasts render at the app root via &lt;Toaster /&gt; — tap a button and watch.</Text>
    </ScreenShell>
  );
}

export function CardScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [count, setCount] = useState(0);
  return (
    <ScreenShell
      testID="screen-card"
      title="Card"
      description="Compound card: header, title, description, content, footer."
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle>Supr Inbox</CardTitle>
          <CardDescription>Mail, triaged by your Threads.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text style={s.body}>3 unread threads need a reply before lunch.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="primary" onPress={() => setCount((n) => n + 1)}>
            Open inbox
          </Button>
        </CardFooter>
      </Card>
      <Text testID="card-open-count" style={s.body}>
        Opened {count} {count === 1 ? 'time' : 'times'}
      </Text>
    </ScreenShell>
  );
}

export function AvatarScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  return (
    <ScreenShell
      testID="screen-avatar"
      title="Avatar"
      description="Three sizes, fallback initials. The last avatar has a broken image source, so its fallback shows."
      onBack={onBack}
    >
      <Section label="Sizes">
        <View style={s.row}>
          <Avatar fallback="SK" size="sm" alt="Sara Kim" />
          <Avatar fallback="SK" size="md" alt="Sara Kim" />
          <Avatar fallback="SK" size="lg" alt="Sara Kim" />
        </View>
      </Section>
      <Section label="Fallback on failed source">
        <View style={s.row}>
          <Avatar src="https://invalid.example/avatar.png" fallback="JT" size="lg" alt="Jamie Tan" />
        </View>
      </Section>
      <Text style={s.muted}>Fallbacks are initials; alt text describes the person.</Text>
    </ScreenShell>
  );
}

export function SwitchScreen({ onBack }: ShowcaseProps) {
  const s = useDemoStyles();
  const [checked, setChecked] = useState(false);
  return (
    <ScreenShell
      testID="screen-switch"
      title="Switch"
      description="Controlled switch with a label, plus a disabled one."
      onBack={onBack}
    >
      <Switch checked={checked} onCheckedChange={setChecked} label="Email notifications" />
      <Switch checked label="Weekly digest (disabled)" disabled onCheckedChange={() => {}} />
      <Text testID="switch-state" style={s.body}>
        Email notifications: {checked ? 'On' : 'Off'}
      </Text>
    </ScreenShell>
  );
}

export const SHOWCASES: Record<ComponentId, (props: ShowcaseProps) => ReactElement> = {
  button: ButtonScreen,
  input: InputScreen,
  dialog: DialogScreen,
  popover: PopoverScreen,
  select: SelectScreen,
  tabs: TabsScreen,
  toast: ToastScreen,
  card: CardScreen,
  avatar: AvatarScreen,
  switch: SwitchScreen,
};
