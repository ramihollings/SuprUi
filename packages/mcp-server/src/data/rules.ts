/**
 * Supr UI MCP — usage guidance.
 *
 * The repo AGENTS.md rules in machine-usable form (structured JSON).
 * This is a summary for agents, not a copy of the file: the full
 * AGENTS.md remains the human-readable authority. Keep the two in sync
 * when the rules change.
 *
 * No color, spacing, radius, or duration values appear here — rules
 * refer to tokens by name only.
 */

export interface GuidanceSection {
  id: string;
  title: string;
  rules: string[];
}

export const GUIDANCE: GuidanceSection[] = [
  {
    id: "tokens",
    title: "Tokens are the only source of truth",
    rules: [
      "Tokens live in packages/tokens/ and are built by Style Dictionary from tokens/*.json (W3C DTCG). Never edit generated token output by hand; edit the token source and rebuild.",
      "Never put a raw hex, raw rgb, literal pixel spacing/radius, or literal duration in a component — use a semantic token. If the value you need has no token, add a token in packages/tokens/; do not inline it.",
      "The brand color lives in exactly one token (--color-brand / theme.colors.brand). Do not hard-code it anywhere else.",
      "Web: import tokens once at the app root with @import \"@mrtechnology/tokens/web.css\". Native: import { theme } from \"@mrtechnology/tokens/native\"; theme.dark is the default, theme.light is the light theme.",
      "The native colors object has no focus entry — the web --color-focus variable has no native counterpart. Do not invent one.",
    ],
  },
  {
    id: "theming",
    title: "Theming — dark is the default",
    rules: [
      "Dark is the default on both platforms. Ship dark first; light must also work, not just exist.",
      "Web: light theme via data-theme=\"light\" on the root element. Dark is the default when the attribute is absent.",
      "Native: use theme.light instead of theme.dark from @mrtechnology/tokens/native.",
      "Never theme by swapping hex values in a component. Theme by switching the token set.",
    ],
  },
  {
    id: "styling",
    title: "Styling",
    rules: [
      "Tailwind v4 utilities mapped from tokens on both platforms (NativeWind on Android). Semantic tokens only — in Tailwind v4 use the @theme mapping (e.g. bg-background, text-muted, rounded-rounded), never a literal value.",
      "Use --color-text-muted for secondary text, --color-border for hairlines, --color-border-strong only where a border must read as a boundary (e.g. focused/active controls). Do not use borderStrong as a default border.",
      "Radius: sharp (0) for flush/dense surfaces, rounded (8px) as the default control radius, extra-rounded (16px) for cards/panels, circular (9999px) for avatars/pills only.",
      "Density is a Supr requirement (dense workspace): prefer the sm/md sizes and the smaller spacing steps unless the surface is a primary reading surface.",
    ],
  },
  {
    id: "motion",
    title: "Motion",
    rules: [
      "Web: Motion. Native: Reanimated. Never use the other platform's runtime, and never hand-roll a duration or spring.",
      "Durations come from tokens: fast, base, slow. Default to base; fast for hover/micro-feedback, slow only for larger transitions (dialog/popover enter).",
      "Easing: ease-out cubic-bezier(0.22, 1, 0.36, 1) unless a spring is specified.",
      "Springs come from tokens: gentle (default) and snappy (responsive controls: Switch, Tabs indicator, Button press).",
      "Respect reduced-motion preferences on web; on native, respect the platform reduced-motion setting. Motion must never be the only signal for a state change.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    rules: [
      "Every interactive component must be keyboard-operable (web) with a visible focus indicator using --color-focus. No outline: none without a replacement focus style.",
      "Icon-only controls (e.g. a Button with only icon) must have an accessible label.",
      "Input with error must expose the error to assistive technology; Switch and Select must expose their state; Dialog must trap focus and return it on close; Tabs must support arrow-key navigation.",
      "Color is never the only signal: danger / success / warning states pair color with text or an icon.",
      "Contrast must hold in both themes, dark and light.",
      "Gate: axe-core clean in Storybook and CI. A new axe violation fails the build — fix it, do not suppress it.",
    ],
  },
  {
    id: "components",
    title: "Components — the contract",
    rules: [
      "Milestone 1 ships exactly 10 components with identical export names on web and native: Button, Input, Dialog, Popover, Select, Tabs, Toast, Card, Avatar, Switch. Do not add an 11th without a decision in decisions.md.",
      "Props listed in the component catalog are the contract — do not invent extra props, and do not rename these.",
      "Build on Base UI (web) / React Native Reusables (native) primitives — do not re-implement focus, keyboard, or dismissal behaviour.",
      "Use Lucide icons, and only Lucide icons, in components.",
      "Do not put sideload-only, Task Thread-only, or Thread-design-language (obsidian/champagne) styling in this repo — that look belongs to Task Thread, not Supr UI.",
      "Every component ships with tests for its props, its disabled/error states, and its keyboard behaviour (web). Do not ship an untested component.",
    ],
  },
];

export function getGuidance(topic: string): GuidanceSection[] {
  if (topic === "all") return GUIDANCE;
  return GUIDANCE.filter((section) => section.id === topic);
}
