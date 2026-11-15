/**
 * Home screen — the navigation-contract entry point.
 *
 * Lists all 10 components by name, in contract order. Tapping a name
 * opens that component's showcase screen (via `onSelect`). Each row
 * carries `nav-<component>` as a stable hook for the e2e suite; the
 * showcase screens themselves carry `screen-<component>`.
 */
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useDemoStyles } from '../screen-shell';

export type ComponentId =
  | 'button'
  | 'input'
  | 'dialog'
  | 'popover'
  | 'select'
  | 'tabs'
  | 'toast'
  | 'card'
  | 'avatar'
  | 'switch';

export interface ComponentEntry {
  id: ComponentId;
  name: string;
  blurb: string;
}

export const COMPONENTS: ComponentEntry[] = [
  { id: 'button', name: 'Button', blurb: 'Variants, sizes, disabled, press feedback' },
  { id: 'input', name: 'Input', blurb: 'Label, placeholder, live value, error state' },
  { id: 'dialog', name: 'Dialog', blurb: 'Controlled open state, actions, confirm flow' },
  { id: 'popover', name: 'Popover', blurb: 'Controlled trigger, positioned content' },
  { id: 'select', name: 'Select', blurb: 'Option list, controlled value, placeholder' },
  { id: 'tabs', name: 'Tabs', blurb: 'Compound tabs with switchable content' },
  { id: 'toast', name: 'Toast', blurb: 'Imperative toasts in all four variants' },
  { id: 'card', name: 'Card', blurb: 'Compound card with header, content, footer' },
  { id: 'avatar', name: 'Avatar', blurb: 'Sizes and fallback initials' },
  { id: 'switch', name: 'Switch', blurb: 'Checked state, label, disabled' },
];

export function HomeScreen({ onSelect }: { onSelect: (id: ComponentId) => void }) {
  const s = useDemoStyles();
  return (
    <View testID="screen-home" style={s.root}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <Text style={s.title}>Supr UI</Text>
        <Text style={s.muted}>
          Black + cobalt, dark-first. Ten components — tap one to open its showcase.
        </Text>
        <View style={{ gap: s.t.spacing[2] }}>
          {COMPONENTS.map((c) => (
            <Pressable
              key={c.id}
              testID={`nav-${c.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${c.name} showcase`}
              onPress={() => onSelect(c.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: s.t.spacing[2],
                padding: s.t.spacing[4],
                backgroundColor: s.t.colors.surface,
                borderRadius: s.t.radii.extraRounded,
                borderWidth: s.t.borderWidth.thin,
                borderColor: s.t.colors.border,
              }}
            >
              <View style={{ gap: s.t.spacing[1], flex: 1 }}>
                <Text style={s.heading}>{c.name}</Text>
                <Text style={s.muted}>{c.blurb}</Text>
              </View>
              <ChevronRight size={s.t.typography.sizes.base.fontSize} color={s.t.colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
