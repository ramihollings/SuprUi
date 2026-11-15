import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // axe runs in every story; violations are reported as errors.
    a11y: {
      test: "error",
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Supr UI theme — dark is the default",
      defaultValue: "dark",
      toolbar: {
        icon: "moon",
        items: [
          { value: "dark", title: "Dark (default)" },
          { value: "light", title: "Light" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as string | undefined;
      const root = document.documentElement;
      if (theme === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        root.removeAttribute("data-theme");
      }
      // The preview iframe is a real document, so give it real document
      // structure: one <main> landmark holding the story, and one h1
      // naming it (visually hidden — the workshop chrome already shows
      // the title). Without these, axe flags every story with
      // landmark-one-main / page-has-heading-one / region — document
      // violations, not component violations. Do not "fix" those by
      // disabling the rules in the test-runner; fix the document.
      return (
        <main className="bg-background p-4 text-text">
          <h1 className="sr-only">
            {context.title} — {context.name}
          </h1>
          <Story />
        </main>
      );
    },
  ],
};

export default preview;
