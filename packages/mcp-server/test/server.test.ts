/**
 * @suprui/mcp-server smoke tests.
 *
 * Covers: server starts, tools/list exposes the 5 tools, tool calls
 * return real repo data (cobalt token from the real token source),
 * resources are listable/readable, and the built stdio binary answers
 * a real JSON-RPC tools/list over stdin/stdout.
 *
 * Run: `npm test --workspace=@suprui/mcp-server` (builds first).
 */
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSuprMcpServer, RESOURCE_URIS, TOOL_NAMES } from "../src/server.js";

interface TextContent {
  type: "text";
  text: string;
}

function parseText(result: unknown): unknown {
  const content = (result as { content: unknown }).content as TextContent[];
  expect(content).toHaveLength(1);
  expect(content[0].type).toBe("text");
  return JSON.parse(content[0].text);
}

describe("supr-ui MCP server (in-process)", () => {
  let client: Client;
  let serverTransport: ReturnType<typeof InMemoryTransport.createLinkedPair>[1];

  beforeEach(async () => {
    client = new Client({ name: "supr-mcp-test", version: "0.0.0" }, { capabilities: {} });
    const server = createSuprMcpServer();
    const [clientTransport, serverTransport_] = InMemoryTransport.createLinkedPair();
    serverTransport = serverTransport_;
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await serverTransport.close();
  });

  it("starts and lists the 5 tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.description).toBeTruthy();
    }
  });

  it("supr_get_token returns the cobalt token value from the real token source", async () => {
    const result = await client.callTool({ name: "supr_get_token", arguments: { path: "color.cobalt.500" } });
    const data = parseText(result) as { source: string; path: string; value: unknown };
    // Brand hex, confirmed from supr.technology's stylesheet (2026-11-13).
    // Asserted here as a test expectation only — the value itself lives
    // in tokens/color.json and is read through @suprui/tokens, never copied.
    expect(data.value).toBe("#1456F0");
    expect(data.path).toBe("color.cobalt.500");
    expect(data.source).toContain("@suprui/tokens");
  });

  it("supr_get_token resolves semantic theme tokens and errors on unknown paths", async () => {
    const dark = (await client.callTool({
      name: "supr_get_token",
      arguments: { path: "color.semantic.dark.brand" },
    })) as { content: unknown };
    expect((parseText(dark) as { value: unknown }).value).toBe("#1456F0");
    const bad = (await client.callTool({
      name: "supr_get_token",
      arguments: { path: "color.nope.500" },
    })) as { content: unknown; isError?: boolean };
    expect(bad.isError).toBe(true);
    expect((parseText(bad) as { error: string }).error).toContain("Unknown token path");
  });

  it("supr_list_tokens lists groups and resolves a group from the real source", async () => {
    const groups = (await client.callTool({ name: "supr_list_tokens", arguments: {} })) as { content: unknown };
    const groupData = parseText(groups) as { groups: { group: string }[] };
    expect(groupData.groups.map((g) => g.group).sort()).toEqual([
      "border",
      "color",
      "motion",
      "radius",
      "spacing",
      "typography",
    ]);
    const colorDark = (await client.callTool({
      name: "supr_list_tokens",
      arguments: { group: "color", theme: "dark" },
    })) as { content: unknown };
    const darkData = parseText(colorDark) as { semantic: Record<string, string> };
    expect(darkData.semantic.background).toBe("#000000");
    expect(darkData.semantic.brand).toBe("#1456F0");
  });

  it("supr_list_components returns exactly the 10 M1 components", async () => {
    const result = (await client.callTool({ name: "supr_list_components", arguments: {} })) as { content: unknown };
    const data = parseText(result) as { count: number; components: { name: string }[] };
    expect(data.count).toBe(10);
    expect(data.components.map((c) => c.name).sort()).toEqual([
      "Avatar",
      "Button",
      "Card",
      "Dialog",
      "Input",
      "Popover",
      "Select",
      "Switch",
      "Tabs",
      "Toast",
    ]);
  });

  it("supr_get_component returns the Button contract with web + native usage", async () => {
    const result = (await client.callTool({
      name: "supr_get_component",
      arguments: { name: "Button" },
    })) as { content: unknown };
    const data = parseText(result) as {
      name: string;
      props: { name: string; values?: string[] }[];
      web: { importFrom: string; usage: string };
      native: { importFrom: string; usage: string };
    };
    expect(data.name).toBe("Button");
    expect(data.props.find((p) => p.name === "variant")?.values).toEqual([
      "primary",
      "secondary",
      "outline",
      "ghost",
      "danger",
    ]);
    expect(data.web.importFrom).toBe("@suprui/ui");
    expect(data.web.usage).toContain('from "@suprui/ui"');
    expect(data.native.importFrom).toBe("@suprui/ui-native");
    expect(data.native.usage).toContain('from "@suprui/ui-native"');
  });

  it("supr_get_component errors on an unknown component", async () => {
    const result = (await client.callTool({
      name: "supr_get_component",
      arguments: { name: "Carousel" },
    })) as { content: unknown; isError?: boolean };
    expect(result.isError).toBe(true);
    expect((parseText(result) as { error: string }).error).toContain("Unknown component");
  });

  it("supr_guidance returns the repo rules, filterable by topic", async () => {
    const all = (await client.callTool({ name: "supr_guidance", arguments: {} })) as { content: unknown };
    const allData = parseText(all) as { sections: { id: string }[] };
    expect(allData.sections.map((s) => s.id)).toEqual([
      "tokens",
      "theming",
      "styling",
      "motion",
      "accessibility",
      "components",
    ]);
    const a11y = (await client.callTool({
      name: "supr_guidance",
      arguments: { topic: "accessibility" },
    })) as { content: unknown };
    const a11yData = parseText(a11y) as { sections: { id: string; rules: string[] }[] };
    expect(a11yData.sections).toHaveLength(1);
    expect(a11yData.sections[0].rules.join(" ")).toContain("axe-core");
  });

  it("lists and reads the 3 resources", async () => {
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri).sort()).toEqual([...RESOURCE_URIS].sort());
    const tokens = await client.readResource({ uri: "supr://tokens" });
    const text = (tokens.contents[0] as { text?: string }).text ?? "";
    const data = JSON.parse(text) as { tokens: { color: { cobalt: Record<string, string> } } };
    expect(data.tokens.color.cobalt["500"]).toBe("#1456F0");
  });
});

describe("supr-ui MCP server (built stdio binary)", () => {
  it("answers tools/list over stdin/stdout", async () => {
    const distIndex = fileURLToPath(new URL("../dist/index.js", import.meta.url));
    const child: ChildProcessWithoutNullStreams = spawn(process.execPath, [distIndex], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const lines: string[] = [];
    let buffer = "";
    const done = new Promise<string[]>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("stdio smoke test timed out")), 10_000);
      child.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf8");
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          lines.push(buffer.slice(0, idx));
          buffer = buffer.slice(idx + 1);
        }
        if (lines.length >= 2) {
          clearTimeout(timer);
          resolve(lines);
        }
      });
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
    const send = (obj: unknown) => child.stdin.write(`${JSON.stringify(obj)}\n`);
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "supr-mcp-smoke", version: "0.0.0" },
      },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    const received = await done;
    child.kill();
    const list = JSON.parse(received[1]) as {
      result?: { tools: { name: string }[] };
    };
    expect(list.result?.tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
  }, 15_000);
});
