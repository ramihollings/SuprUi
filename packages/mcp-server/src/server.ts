/**
 * Supr UI MCP server — @mrtechnology/mcp-server.
 *
 * Transport: stdio only. This is a local development tool: the client
 * (Claude Code, Cursor, VS Code, …) spawns it and speaks MCP over
 * stdin/stdout. No network port, no auth surface, nothing to host.
 *
 * Tools (all return JSON as text):
 *   supr_list_tokens      token groups, or one group's resolved values
 *   supr_get_token        one token by dot path, e.g. color.cobalt.500
 *   supr_list_components  the 10 components with a one-line summary each
 *   supr_get_component    full props + web/native usage for one component
 *   supr_guidance         the AGENTS.md rules in machine-usable form
 *
 * Resources (read-only snapshots of the same data):
 *   supr://tokens      full resolved token tree
 *   supr://components  full component catalog
 *   supr://guidance    full guidance rules
 *
 * Token values always come from the real token source
 * (@mrtechnology/tokens dist/tokens.json); nothing here duplicates them.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { COMPONENTS, getComponent } from "./data/components.js";
import { GUIDANCE, getGuidance } from "./data/rules.js";
import {
  TOKEN_GROUPS,
  TOKEN_SOURCE,
  getTokenByPath,
  loadTokens,
  type TokenGroup,
} from "./data/tokens.js";

export const SERVER_NAME = "supr-ui";
export const SERVER_VERSION = "0.1.0";

export const TOOL_NAMES = [
  "supr_list_tokens",
  "supr_get_token",
  "supr_list_components",
  "supr_get_component",
  "supr_guidance",
] as const;

export const RESOURCE_URIS = ["supr://tokens", "supr://components", "supr://guidance"] as const;

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }, null, 2) }],
    isError: true,
  };
}

export function createSuprMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.tool(
    "supr_list_tokens",
    "List Supr UI design tokens. Without a group, lists the token groups. With a group, returns that group's resolved values from the real token source. With group=color and a theme, returns the semantic colors for that theme (dark is the default); the cobalt/black ramps are theme-independent.",
    {
      group: z.enum(TOKEN_GROUPS).optional().describe("Token group to list"),
      theme: z.enum(["dark", "light"]).optional().describe("Theme for semantic colors (group=color only)"),
    },
    ({ group, theme }) => {
      const tokens = loadTokens() as Record<string, unknown>;
      if (!group) {
        return textResult({
          source: TOKEN_SOURCE,
          groups: TOKEN_GROUPS.map((g) => ({
            group: g,
            topLevelKeys: Object.keys(tokens[g] as Record<string, unknown>),
          })),
        });
      }
      if (group === "color" && theme) {
        const color = tokens.color as Record<string, unknown>;
        return textResult({
          source: TOKEN_SOURCE,
          group: "color",
          theme,
          semantic: (color.semantic as Record<string, unknown>)[theme],
          note: "Cobalt and black ramps are theme-independent; see supr_get_token color.cobalt.500 or list group=color without a theme for the full group.",
        });
      }
      return textResult({ source: TOKEN_SOURCE, group, values: tokens[group] });
    },
  );

  server.tool(
    "supr_get_token",
    "Get one Supr UI design token by dot path (e.g. color.cobalt.500, color.semantic.dark.brand, spacing.4, radius.rounded, motion.duration.base, typography.size.base.fontSize). Values come from the real token source, never from a copy.",
    {
      path: z.string().min(1).describe("Dot path into the token tree"),
    },
    ({ path }) => {
      const { found, value } = getTokenByPath(path);
      if (!found) {
        return errorResult(
          `Unknown token path "${path}". Use supr_list_tokens to see the groups, e.g. color.cobalt.500, color.semantic.dark.brand, spacing.4, radius.rounded, motion.duration.base.`,
        );
      }
      return textResult({ source: TOKEN_SOURCE, path, value });
    },
  );

  server.tool(
    "supr_list_components",
    "List the 10 Supr UI components with a one-line summary and prop names. Export names are identical on web (@mrtechnology/ui) and native (@mrtechnology/ui-native).",
    {},
    () => {
      return textResult({
        count: COMPONENTS.length,
        components: COMPONENTS.map((c) => ({
          name: c.name,
          summary: c.summary,
          props: c.props.map((p) => p.name),
        })),
      });
    },
  );

  server.tool(
    "supr_get_component",
    "Get the full contract for one Supr UI component: props, web usage (@mrtechnology/ui), native usage (@mrtechnology/ui-native), and notes. Prop names are the contract — do not invent extra props.",
    {
      name: z.string().min(1).describe("Component name, e.g. Button"),
    },
    ({ name }) => {
      const component = getComponent(name);
      if (!component) {
        return errorResult(
          `Unknown component "${name}". The 10 components are: ${COMPONENTS.map((c) => c.name).join(", ")}.`,
        );
      }
      return textResult(component);
    },
  );

  server.tool(
    "supr_guidance",
    "Get the Supr UI repo rules (AGENTS.md) in machine-usable form: tokens, theming, styling, motion, accessibility, and the component contract. Use topic=all for everything, or one section.",
    {
      topic: z
        .enum(["all", "tokens", "theming", "styling", "motion", "accessibility", "components"])
        .optional()
        .describe("Guidance section to return"),
    },
    ({ topic = "all" }) => {
      return textResult({
        source: "Repo AGENTS.md, structured for agents (full file remains the authority)",
        sections: getGuidance(topic),
      });
    },
  );

  server.resource("supr-tokens", "supr://tokens", async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ source: TOKEN_SOURCE, tokens: loadTokens() }, null, 2),
        },
      ],
    };
  });

  server.resource("supr-components", "supr://components", async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ count: COMPONENTS.length, components: COMPONENTS }, null, 2),
        },
      ],
    };
  });

  server.resource("supr-guidance", "supr://guidance", async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ source: "Repo AGENTS.md, structured for agents", sections: GUIDANCE }, null, 2),
        },
      ],
    };
  });

  return server;
}

export type { TokenGroup };
