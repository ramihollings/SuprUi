#!/usr/bin/env bash
# Run the Supr UI Android e2e suite (Maestro) against apps/demo.
# Usage:
#   ./run.sh                        # every flow in flows/, in order
#   ./run.sh flows/02-button.yaml   # one flow
#   APP_ID=com.example.other ./run.sh   # demo app with a different package
set -euo pipefail

APP_ID="${APP_ID:-technology.supr.demo}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$HERE/flows}"

if ! command -v maestro >/dev/null 2>&1; then
  echo "error: Maestro CLI not found." >&2
  echo "Install it first (needs Java 17+):" >&2
  echo '  curl -fsSL "https://get.maestro.mobile.dev" | bash' >&2
  echo "  # macOS alternative: brew install maestro" >&2
  exit 1
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "error: adb not found — install the Android SDK platform-tools and put them on PATH." >&2
  exit 1
fi

if ! adb devices | grep -q -v -e "List of devices" -e "^$" -e "daemon"; then
  echo "error: no device or emulator connected (adb devices is empty)." >&2
  echo "Boot an emulator or plug in a device with USB debugging on, then retry." >&2
  exit 1
fi

if ! adb shell pm list packages | grep -q "$APP_ID"; then
  echo "error: demo app package '$APP_ID' is not installed on the connected device." >&2
  echo "Build + install it first, e.g. from apps/demo:" >&2
  echo "  npx expo run:android" >&2
  echo "If the demo app uses a different android.package, pass it as APP_ID=<package>." >&2
  exit 1
fi

exec maestro test -e "APP_ID=$APP_ID" "$TARGET"
