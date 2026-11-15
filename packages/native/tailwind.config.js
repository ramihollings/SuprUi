/**
 * Supr UI — NativeWind v4 (Tailwind CSS v3) theme mapping for the
 * CONSUMING APP.
 *
 * Copy this file into the consuming app as `tailwind.config.js` (or
 * merge its `theme.extend` into the app's own config) and point its
 * `content` at the app's source. It maps the Supr token variables
 * (from `@mrtechnology/tokens/web.css`, imported by `src/global.css`) to
 * Tailwind utilities: `bg-background`, `text-text-muted`,
 * `border-border`, `bg-brand`, `rounded-rounded`, `text-xs`, …
 * No hex or pixel literal appears here — every value is a `var()`
 * reference to a token.
 *
 * Spacing needs no mapping: Tailwind's default scale is built on a
 * 0.25rem base, so `p-4` is 16px — the same 4pt steps as the token
 * spacing scale. `border-none` is intentionally NOT mapped: Tailwind's
 * `border-none` already means border-style none (see the tokens
 * README); use the `--border-none` variable directly if a 0 width is
 * needed.
 *
 * NativeWind version note: stable NativeWind v4 pairs with Tailwind
 * CSS v3 (this file) — the CSS-first `@theme` wiring belongs to
 * NativeWind v5 (preview). See `src/global.css`.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: update these globs to the consuming app's source layout.
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceRaised: 'var(--color-surface-raised)',
        border: 'var(--color-border)',
        borderStrong: 'var(--color-border-strong)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        brand: 'var(--color-brand)',
        brandHover: 'var(--color-brand-hover)',
        brandForeground: 'var(--color-brand-foreground)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        cobalt: {
          50: 'var(--color-cobalt-50)',
          100: 'var(--color-cobalt-100)',
          200: 'var(--color-cobalt-200)',
          300: 'var(--color-cobalt-300)',
          400: 'var(--color-cobalt-400)',
          500: 'var(--color-cobalt-500)',
          600: 'var(--color-cobalt-600)',
          700: 'var(--color-cobalt-700)',
          800: 'var(--color-cobalt-800)',
          900: 'var(--color-cobalt-900)',
        },
      },
      borderRadius: {
        sharp: 'var(--radius-sharp)',
        rounded: 'var(--radius-rounded)',
        extraRounded: 'var(--radius-extra-rounded)',
        circular: 'var(--radius-circular)',
      },
      borderWidth: {
        thin: 'var(--border-width-thin)',
        fat: 'var(--border-width-fat)',
      },
      fontSize: {
        xs: ['var(--font-size-xs)', 'var(--line-height-xs)'],
        sm: ['var(--font-size-sm)', 'var(--line-height-sm)'],
        base: ['var(--font-size-base)', 'var(--line-height-base)'],
        lg: ['var(--font-size-lg)', 'var(--line-height-lg)'],
        xl: ['var(--font-size-xl)', 'var(--line-height-xl)'],
        '2xl': ['var(--font-size-2xl)', 'var(--line-height-2xl)'],
        '3xl': ['var(--font-size-3xl)', 'var(--line-height-3xl)'],
      },
      fontWeight: {
        regular: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
    },
  },
  plugins: [],
};
