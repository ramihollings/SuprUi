---
title: Supr UI
description: Black + cobalt design language for Supr — web and Android, from one shared token source of truth.
template: splash
hero:
  tagline: Black + cobalt design language for Supr — web and Android, from one shared token source of truth.
  actions:
    - text: Get started
      link: /guides/installation/
      icon: right-arrow
    - text: Browse components
      link: /components/button/
      variant: minimal
---

## One system, two platforms

Supr UI is the design language for [Supr](https://supr.technology) — a dense
productivity workspace — built from five sources and shipped as one system:
shared [W3C tokens](/tokens/color/) (Style Dictionary + Tokens Studio),
[web components](/components/button/) on shadcn/ui + Base UI + Tailwind v4,
and [Android components](/components/button/) on NativeWind + React Native
Reusables. Component export names are identical on web and native.

## The rules, in one breath

- **Tokens are the only source of truth.** Never a raw hex, pixel, or duration in a component — use a semantic token.
- **Dark is the default.** Light must work, not just exist.
- **Exactly 10 components.** No 11th without a decision.
- **Black + cobalt.** Cobalt primary lives in exactly one token (`--color-brand`); it is never hard-coded anywhere else.
- **Accessibility is a gate.** axe-core clean — a new violation fails the build, it is never suppressed.

## Where to look

- New here? Start with [Installation](/guides/installation/), then [Theming](/guides/theming/).
- Building a screen? Pick a component from the sidebar — every page shows the web and native usage side by side.
- Checking a value? The [Tokens](/tokens/color/) pages list every token with its exact value in both themes.
- Working in the repo? Read `AGENTS.md` and `decisions.md` at the repo root — they are the contract these docs describe.
