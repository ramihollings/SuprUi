/**
 * @mrtechnology/ui-native — Supr UI components for Android (React Native).
 *
 * Export names are identical to `@mrtechnology/ui` (web). Dark is the default
 * theme; render `<ThemeProvider mode="light">` once at the app root to
 * opt into light. All styling comes from the `@mrtechnology/tokens` theme
 * object — see `./theme`.
 *
 * Portal-based components (Dialog, Popover, Select) need a
 * `<PortalHost />` from `@rn-primitives/portal` mounted once at the
 * app root. Toast needs a `<Toaster />` mounted once at the app root.
 *
 * Code-verified only (tsc + Vitest in Node): no Android hardware is
 * available in this repo, so on-device rendering is NOT verified.
 */
export { Button } from './components/button/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/button/Button';
export { Input } from './components/input/Input';
export type { InputProps, InputSize } from './components/input/Input';
export { Dialog } from './components/dialog/Dialog';
export type { DialogProps } from './components/dialog/Dialog';
export { Popover } from './components/popover/Popover';
export type { PopoverAlign, PopoverProps, PopoverSide } from './components/popover/Popover';
export { Select } from './components/select/Select';
export type { SelectOption, SelectProps } from './components/select/Select';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs/Tabs';
export type { TabsProps } from './components/tabs/Tabs';
export { Toaster, dismissToast, toast } from './components/toast/Toast';
export type { ToastOptions, ToastVariant } from './components/toast/Toast';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/card/Card';
export { Avatar } from './components/avatar/Avatar';
export type { AvatarProps, AvatarSize } from './components/avatar/Avatar';
export { Switch } from './components/switch/Switch';
export type { SwitchProps } from './components/switch/Switch';
export { ThemeProvider, fontWeight, theme, useTheme, useThemeMode } from './theme';
export type { SuprTheme, Theme, ThemeMode } from './theme';
