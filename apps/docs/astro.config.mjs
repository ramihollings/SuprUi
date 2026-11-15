import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Supr UI docs — Astro + Starlight (decision D8).
// Brand styling lives in src/styles/custom.css, which maps Starlight's
// CSS variables onto the @mrtechnology/tokens variables. No literal color,
// spacing, radius, or duration values appear in this file or in the
// custom stylesheet — tokens are the only source of truth.
export default defineConfig({
  integrations: [
    starlight({
      title: "Supr UI",
      description:
        "Black + cobalt design language for Supr — web and Android, from one shared token source of truth.",
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Guides",
          items: [
            { label: "Introduction", slug: "index" },
            { label: "Installation", slug: "guides/installation" },
            { label: "Theming", slug: "guides/theming" },
            { label: "Accessibility", slug: "guides/accessibility" },
          ],
        },
        {
          label: "Tokens",
          items: [
            { label: "Color", slug: "tokens/color" },
            {
              label: "Spacing, radius & borders",
              slug: "tokens/spacing-radius-border",
            },
            { label: "Typography", slug: "tokens/typography" },
            { label: "Motion", slug: "tokens/motion" },
          ],
        },
        {
          label: "Components",
          items: [
            { label: "Button", slug: "components/button" },
            { label: "Input", slug: "components/input" },
            { label: "Dialog", slug: "components/dialog" },
            { label: "Popover", slug: "components/popover" },
            { label: "Select", slug: "components/select" },
            { label: "Tabs", slug: "components/tabs" },
            { label: "Toast", slug: "components/toast" },
            { label: "Card", slug: "components/card" },
            { label: "Avatar", slug: "components/avatar" },
            { label: "Switch", slug: "components/switch" },
          ],
        },
      ],
    }),
  ],
});
