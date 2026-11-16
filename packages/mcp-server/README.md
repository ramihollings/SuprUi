# @suprui/mcp-server

Supr UI MCP server — exposes the design system to AI agents over **stdio**.

- **Tokens:** read live from the real token source (`@suprui/tokens`
  `dist/tokens.json`, the Style Dictionary build of `tokens/*.json`).
  Nothing here duplicates token values by hand.
- **Components:** the 10 Milestone 1 components — names, props (the
  AGENTS.md contract), web (`@suprui/ui`) and native (`@suprui/ui-native`)
  usage.
- **Guidance:** the repo AGENTS.md rules in machine-usable form.

## Run

```bash
# Build tokens first if they have never been built:
npm run build --workspace=@suprui/tokens

# Build + start the server (stdio):
npm run build --workspace=@suprui/mcp-server
npm start --workspace=@suprui/mcp-server
```

Requires Node >= 20.

## Connect a client

Claude Code / Cursor / VS Code MCP config (adjust the path to your
checkout):

```json
{
  "mcpServers": {
    "supr-ui": {
      "command": "node",
      "args": ["/path/to/design-system/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Or, after `npm link` in this package, `supr-mcp` on your `PATH`.

Transport is stdio only, by design: this is a local development tool.
No network port, no auth surface, nothing to host. (An HTTP/SSE
transport is a later decision if the server ever needs to be shared.)

## Tools

| Tool | What it returns |
|---|---|
| `supr_list_tokens` | Token groups, or one group's resolved values; `group=color` + `theme` returns that theme's semantic colors (dark is the default) |
| `supr_get_token` | One token by dot path, e.g. `color.cobalt.500`, `color.semantic.dark.brand`, `spacing.4`, `radius.rounded`, `motion.duration.base` |
| `supr_list_components` | The 10 components with a one-line summary and prop names |
| `supr_get_component` | Full contract for one component: props, web + native usage, notes |
| `supr_guidance` | AGENTS.md rules in machine-usable form; `topic` filters to one section (`tokens`, `theming`, `styling`, `motion`, `accessibility`, `components`, or `all`) |

## Resources

| URI | Contents |
|---|---|
| `supr://tokens` | Full resolved token tree |
| `supr://components` | Full component catalog |
| `supr://guidance` | Full guidance rules |

## Test

```bash
npm test --workspace=@suprui/mcp-server   # builds, then runs Vitest (10 tests)
npm run typecheck --workspace=@suprui/mcp-server
```

Tests cover: server starts and lists its 5 tools; `supr_get_token`
returns the cobalt token value from the real token source; unknown
token paths and components error cleanly; the component list is
exactly the 10 M1 components; guidance filters by topic; the 3
resources read; and the built stdio binary answers `tools/list`
over stdin/stdout.

## License notes

- This package: MIT (repo `LICENSE`).
- Dependency `@modelcontextprotocol/sdk` 1.32.2: **MIT** in the
  installed package (`node_modules/@modelcontextprotocol/sdk/LICENSE`,
  "Copyright (c) 2024 Anthropic, PBC"). Note: the SDK's GitHub `main`
  LICENSE file currently carries a transition preamble (new
  contributions under Apache-2.0, un-relicensed older contributions
  still MIT, docs under CC-BY-4.0). Either way the SDK is permissive
  and safe to ship as a dependency; the installed artifact is MIT.
