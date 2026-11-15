import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

// Starlight docs collection (required by @astrojs/starlight 0.30+ on
// Astro 5+): the loader reads src/content/docs/, the schema validates
// Starlight frontmatter (title, sidebar, template, hero, …).
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
