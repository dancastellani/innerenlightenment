#!/bin/sh
# Helper for common development tasks. Run ./run.sh with no arguments for help.
set -e

major=$(node --version 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/')
if [ -z "$major" ] || [ "$major" -lt 24 ]; then
  echo "Node 24 or newer is required: https://nodejs.org/" >&2
  exit 1
fi

case "$1" in
  test)      node --test scripts/*.test.ts mobile/*.test.ts ;;
  export)    node scripts/export-fonteviva.ts content/pt.json ;;
  translate) node scripts/translate.ts "${2:-en}" ;;
  app)       cd mobile && npm install && npx expo start ;;
  *)
    echo "Usage: ./run.sh <command>"
    echo
    echo "  test              run the tests"
    echo "  export            download all messages from fonteviva.org into content/pt.json"
    echo "  translate [lang]  translate content/pt.json into content/<lang>.json (default en, needs GEMINI_API_KEY)"
    echo "  app               start the app; scan the QR code with Expo Go on your phone"
    ;;
esac
