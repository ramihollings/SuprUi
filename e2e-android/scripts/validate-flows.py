#!/usr/bin/env python3
"""Offline validation for the Supr UI Android e2e Maestro flows.

Checks syntax and house-rule discipline WITHOUT a device or the Maestro CLI:
  - every flow parses as YAML with an `appId` (the ${APP_ID} placeholder)
    and a command list after the `---` separator
  - every command is a known Maestro command
  - no coordinate taps (no `point:` selectors, no `tapOn` with x/y)
  - no raw hex colours, no raw pixel/duration literals
  - every `id:` selector used exists as a real `testID` in apps/demo/src
    (literal testIDs plus the `nav-<component>` rows built from the
    HomeScreen COMPONENTS list)

Usage: python3 scripts/validate-flows.py
Exit code 0 = all flows valid. This is a syntax/discipline check only;
it does not run the app.
"""

import re
import sys
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent.parent
FLOWS_DIR = HERE / "flows"
DEMO_SRC = (HERE / ".." / "apps" / "demo" / "src").resolve()

KNOWN_COMMANDS = {
    "launchApp",
    "tapOn",
    "assertVisible",
    "assertNotVisible",
    "assertTrue",
    "inputText",
    "hideKeyboard",
    "back",
    "scroll",
    "swipe",
    "waitForAnimationToEnd",
    "runFlow",
    "runScript",
    "clearState",
    "pressKey",
    "takeScreenshot",
    "assertWithAI",
    "copyTextFrom",
    "pasteText",
    "eraseText",
    "openLink",
    "setLocation",
    "startRecording",
    "stopRecording",
    "retry",
}

HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
# Raw durations (e.g. timeout: 500, "500ms") — flows must use Maestro defaults.
DURATION_RE = re.compile(r"\b\d+\s*(ms|s)\b", re.IGNORECASE)


def fail(errors, msg):
    errors.append(msg)


def check_flow(path, errors, used_ids):
    text = path.read_text()
    try:
        docs = list(yaml.safe_load_all(text))
    except yaml.YAMLError as exc:
        fail(errors, f"{path.name}: invalid YAML: {exc}")
        return
    docs = [d for d in docs if d is not None]
    if len(docs) != 2:
        fail(errors, f"{path.name}: expected 2 YAML documents (config + commands), got {len(docs)}")
        return
    config, commands = docs
    if not isinstance(config, dict) or "appId" not in config:
        fail(errors, f"{path.name}: missing top-level appId")
    elif config["appId"] != "${APP_ID}":
        fail(errors, f"{path.name}: appId must be the ${{APP_ID}} placeholder, got {config['appId']!r}")
    if "name" not in config:
        fail(errors, f"{path.name}: missing flow name")
    if not isinstance(commands, list) or not commands:
        fail(errors, f"{path.name}: no commands after ---")
        return
    if not any(isinstance(c, dict) and "launchApp" in c for c in commands):
        fail(errors, f"{path.name}: no launchApp step")

    raw = text
    if "point:" in raw or re.search(r"\btapOn:\s*\n\s+point:", raw):
        fail(errors, f"{path.name}: coordinate tap (point:) is forbidden")
    if HEX_RE.search(raw):
        fail(errors, f"{path.name}: raw hex value found (house rule: tokens only)")
    if DURATION_RE.search(raw):
        fail(errors, f"{path.name}: raw duration literal found (use Maestro defaults)")

    def walk(node):
        if isinstance(node, dict):
            yield from node.items()
            for v in node.values():
                yield from walk(v)
        elif isinstance(node, list):
            for v in node:
                yield from walk(v)

    for cmd in commands:
        if isinstance(cmd, str):
            # Bare command with no arguments, e.g. `- back` / `- hideKeyboard`.
            if cmd not in KNOWN_COMMANDS:
                fail(errors, f"{path.name}: unknown Maestro command {cmd!r}")
            continue
        if not isinstance(cmd, dict) or len(cmd) != 1:
            fail(errors, f"{path.name}: malformed command step: {cmd!r}")
            continue
        name = next(iter(cmd))
        if name not in KNOWN_COMMANDS:
            fail(errors, f"{path.name}: unknown Maestro command {name!r}")
        for key, value in walk(cmd):
            if key == "id" and isinstance(value, str):
                used_ids.add(value)


def demo_test_ids():
    """Every testID the demo app actually renders.

    Literal testID="..." attributes, plus the nav-<component> rows built
    from the HomeScreen COMPONENTS id list via `nav-${c.id}`.
    """
    ids = set()
    if not DEMO_SRC.is_dir():
        return ids
    for src in DEMO_SRC.rglob("*.tsx"):
        text = src.read_text()
        ids |= set(re.findall(r'testID="([^"]+)"', text))
        comp_ids = re.findall(r"\{\s*id:\s*'([a-z]+)'", text)
        if "nav-${c.id}" in text:
            ids |= {f"nav-{c}" for c in comp_ids}
    return ids


def main():
    errors = []
    flows = sorted(FLOWS_DIR.glob("*.yaml"))
    if not flows:
        print("no flows found")
        return 1

    used_ids = set()
    for flow in flows:
        check_flow(flow, errors, used_ids)

    # Every id: selector must exist as a real testID in the demo app source.
    real_ids = demo_test_ids()
    if not real_ids:
        errors.append(f"demo source not found at {DEMO_SRC} — cannot verify testIDs")
    for used in sorted(used_ids - real_ids):
        errors.append(f"{used}: used in a flow but no such testID in apps/demo/src")

    for flow in flows:
        print(f"OK  {flow.name}" if not any(flow.name in e for e in errors) else f"FAIL {flow.name}")

    if errors:
        print(f"\n{len(errors)} problem(s):")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"\n{len(flows)} flow(s) valid; {len(used_ids)} id selectors all exist in apps/demo/src.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
