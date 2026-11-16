#!/usr/bin/env node
/**
 * @suprui/mcp-server entry point — stdio transport.
 *
 * Run: `npm start --workspace=@suprui/mcp-server`
 * (or `node packages/mcp-server/dist/index.js` from the repo root).
 * Requires @suprui/tokens to be built first (`npm run build` at the root).
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSuprMcpServer } from "./server.js";

const server = createSuprMcpServer();
const transport = new StdioServerTransport();

try {
  await server.connect(transport);
} catch (error) {
  console.error(`supr-mcp: failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
