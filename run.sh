#!/bin/sh
# Helper for common development tasks. Run ./run.sh with no arguments for help.
set -e

major=$(node --version 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/')
if [ -z "$major" ] || [ "$major" -lt 24 ]; then
  echo "Node 24 or newer is required: https://nodejs.org/" >&2
  exit 1
fi

case "$1" in
  test)   node --test scripts/*.test.ts ;;
  specs)  npx cucumber-js specs/ops --import 'specs/ops/steps/*.ts' --tags 'not @pending' ;;
  export) node scripts/export-fonteviva.ts content/pt.json ;;
  *)
    echo "Usage: ./run.sh <command>"
    echo
    echo "  test     run the tests"
    echo "  specs    run the specs in specs/ops (run npm install once first)"
    echo "  export   download all messages from fonteviva.org into content/pt.json"
    ;;
esac
