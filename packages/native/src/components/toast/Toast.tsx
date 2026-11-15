/**
 * Toast — Supr UI native.
 *
 * Imperative API matching the web package: call `toast({ title,
 * description, variant })` anywhere and render `<Toaster />` once at
 * the app root. Each toast renders through `@rn-primitives/toast`
 * (`Root` / `Title` / `Description`), so the presentational layer is
 * the shared primitive; the queue, the auto-dismiss and the enter/exit
 * motion are this package's (the primitive has no queue).
 *
 * Variants pair colour with a Lucide icon — colour is never the only
 * signal. Enter/exit uses the base token duration (200ms).
 *
 * Known gap (documented in the README): the auto-dismiss timeout
 * (4000ms) has no token — the token set defines motion durations, not
 * a toast lifetime. If a `duration-toast` token is added, this should
 * read it.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as ToastPrimitive from '@rn-primitives/toast';
import { fontWeight, useTheme } from '../../theme';
import type { SuprTheme } from '../../theme';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends Required<Pick<ToastOptions, 'variant'>> {
  id: number;
  title: string;
  description?: string;
}

/** Auto-dismiss lifetime. No token exists for this — see the header. */
const TOAST_LIFETIME_MS = 4000;

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function toast(options: ToastOptions): number {
  const item: ToastItem = {
    id: nextId++,
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'default',
  };
  items = [...items, item];
  emit();
  return item.id;
}

export function dismissToast(id: number): void {
  items = items.filter((t) => t.id !== id);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return items;
}

function variantColor(t: SuprTheme, variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return t.colors.success;
    case 'error':
      return t.colors.danger;
    case 'warning':
      return t.colors.warning;
    default:
      return t.colors.brand;
  }
}

function ToastView({ item }: { item: ToastItem }) {
  const t = useTheme();
  const [open, setOpen] = useState(true);
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: t.motion.durationBase });
    if (!open) {
      const timer = setTimeout(
        () => dismissToast(item.id),
        t.motion.durationBase,
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, progress, t.motion.durationBase, item.id]);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), TOAST_LIFETIME_MS);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * t.spacing[2] }],
  }));

  const color = variantColor(t, item.variant);
  const Icon =
    item.variant === 'success'
      ? CheckCircle2
      : item.variant === 'error'
        ? XCircle
        : item.variant === 'warning'
          ? AlertTriangle
          : Info;

  return (
    // asChild: the animated style needs an Animated host; the primitive's
    // style prop only accepts plain ViewStyle.
    <ToastPrimitive.Root open={open} onOpenChange={setOpen} asChild>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: t.spacing[2],
            width: '100%',
            backgroundColor: t.colors.surfaceRaised,
            borderRadius: t.radii.rounded,
            borderWidth: t.borderWidth.thin,
            borderColor: t.colors.border,
            borderLeftWidth: t.borderWidth.fat,
            borderLeftColor: color,
            padding: t.spacing[3],
          },
          style,
        ]}
      >
        <Icon size={t.typography.sizes.base.fontSize} color={color} />
        <View style={{ flex: 1 }}>
          <ToastPrimitive.Title
            style={{
              color: t.colors.text,
              fontSize: t.typography.sizes.sm.fontSize,
              lineHeight: t.typography.sizes.sm.lineHeight,
              fontWeight: fontWeight(t, 'semibold'),
            }}
          >
            {item.title}
          </ToastPrimitive.Title>
          {item.description ? (
            <ToastPrimitive.Description
              style={{
                color: t.colors.textMuted,
                fontSize: t.typography.sizes.sm.fontSize,
                lineHeight: t.typography.sizes.sm.lineHeight,
                marginTop: t.spacing[1],
              }}
            >
              {item.description}
            </ToastPrimitive.Description>
          ) : null}
        </View>
        <Pressable
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          style={{ padding: t.spacing[1] }}
        >
          <X size={t.typography.sizes.sm.fontSize} color={t.colors.textMuted} />
        </Pressable>
      </Animated.View>
    </ToastPrimitive.Root>
  );
}

export function Toaster() {
  const t = useTheme();
  const toasts = useSyncExternalStore(subscribe, getSnapshot);
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: t.spacing[4],
        right: t.spacing[4],
        bottom: t.spacing[6],
        gap: t.spacing[2],
        alignItems: 'center',
      }}
    >
      {toasts.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
    </View>
  );
}
