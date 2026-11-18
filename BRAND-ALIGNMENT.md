# SuprUi alignment with supr.technology

Source of truth: https://supr.technology/ (observed 2026-11-17). This is Supr's own design system, with Cloudflare's pragmatic product-UI principles as inspiration, **not** a copy of Cloudflare's colors, fonts, logos, or product surfaces.

## Brand contract

| Role | Supr implementation |
| --- | --- |
| Brand / action | `#1456F0` from `tokens/color.json` (do not duplicate literal values inside components) |
| Dark background | `#000000`, dark default |
| Primary web type | Plus Jakarta Sans, system fallback; consuming app provides font files |
| Technical / code type | JetBrains Mono, monospace fallback; consuming app provides font files |
| Public-site CTA | `Button shape="pill"` — radius from `--radius-circular` |
| Workspace CTA | `Button shape="control"` (default) — radius from `--radius-rounded` |
| Layout | 4px spacing scale, dense work surfaces, responsive content |
| Focus | Visible 2px cobalt focus outline and accessible keyboard semantics |
| Light | Supported opt-in `data-theme="light"`; never assume dark-only users |

## Product surfaces

- **supr.technology:** editorial headings, generous section spacing, pill calls to action. Use the same tokens but do not impose dashboard density on marketing pages.
- **SuprOS:** compact controls, high information density, readable task/composer states, unambiguous action status.
- **SuprCMS:** source/edit/preview/publish distinctions; surface the revision and publish status clearly. Preserve EmDash's editor and publishing semantics.
- **SuprInbox:** message density, keyboard interactions, clearly separated draft and send actions.
- **React Native:** shared color, spacing, and Button shape. Native `typography.fontFamily` intentionally stays a system stack until the app explicitly installs and configures the branded font family; do not pass a CSS font list to React Native.

## Cloudflare inspiration / boundaries

Cloudflare documents reusable design tokens, consistent dashboard components, responsive interfaces, and dark-mode variable switching. Supr borrows the **approach**: semantic tokens, accessible states, responsive density, and consistent input/action behavior. It does not adopt Cloudflare's orange, trademarks, layout assets, or fonts.

References: https://blog.cloudflare.com/dark-mode/ and https://developers.cloudflare.com/realtime/realtimekit/humans/ui-kit/branding/design-system/

## Adoption check (staging first)

1. Load licensed/self-hosted Plus Jakarta Sans and JetBrains Mono fonts in the consuming web app; confirm fallback if blocked.
2. Verify semantic CSS utilities resolve in both dark and light themes; compare action, input, and focus states to the live site.
3. Verify `Button shape="pill"` in marketing CTA areas and default `control` in SuprOS/CMS/Inbox.
4. Run existing token, web, native, axe, and Storybook regression suites before releasing any new npm version.
5. Roll out per consumer in staging; no production deployment or npm publication is implied by these source changes.
