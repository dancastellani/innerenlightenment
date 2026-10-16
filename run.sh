#!/bin/sh
# Helper for common development tasks. Run ./run.sh with no arguments for help.
set -e

major=$(node --version 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/')
if [ -z "$major" ] || [ "$major" -lt 24 ]; then
  echo "Node 24 or newer is required: https://nodejs.org/" >&2
  exit 1
fi

case "$1" in
  setup)
    # Installs everything needed for development: Cucumber at the root and the app's packages.
    npm ci && cd mobile && npm ci
    ;;
  test)
    # Runs the unit tests and the specs, each with its own summary, and fails if either fails.
    status=0
    # Besides the output, each writes a JUnit report to test-reports/, which GitHub shows in the Checks tab.
    mkdir -p test-reports
    node --test --test-reporter=spec --test-reporter-destination=stdout \
      --test-reporter=junit --test-reporter-destination=test-reports/unit.xml \
      scripts/*.test.ts mobile/*.test.ts || status=1
    npx cucumber-js specs/ops --import 'specs/ops/steps/*.ts' --tags 'not @pending' \
      --format pretty --format junit:test-reports/specs.xml --format-options '{"junit":{"suiteName":"Specs"}}' || status=1
    exit $status
    ;;
  export)    node scripts/export-fonteviva.ts content/pt.json ;;
  translate) node scripts/translate.ts "${2:-en}" ;;
  app)       cd mobile && npm install && npx expo start ;;
  preview)
    # Publishes the checked-out code to its own EAS Update branch, named after the git branch,
    # so it never reaches the production channel. Needs `npx eas-cli@latest login` once.
    branch="preview-$(git branch --show-current | tr '/' '-')"
    cd mobile && npm install && npx --yes eas-cli@latest update --branch "$branch" --message "$branch"
    ;;
  build)
    # Builds the Android app on Expo's servers: "preview" makes an APK to install on a phone,
    # "production" makes an AAB to upload to the Play Store. Needs `npx eas-cli@latest login` once.
    cd mobile && npm install && npx --yes eas-cli@latest build --platform android --profile "${2:-preview}"
    ;;
  *)
    echo "Usage: ./run.sh <command>"
    echo
    echo "  setup             install the packages for the tests and the app (run this first)"
    echo "  test              run the tests and the specs in specs/ops"
    echo "  export            download all messages from fonteviva.org into content/pt.json"
    echo "  translate [lang]  translate content/pt.json into content/<lang>.json (default en, needs GEMINI_API_KEY)"
    echo "  app               start the app; scan the QR code with Expo Go on your phone"
    echo "  preview           publish the checked-out branch to Expo; open the printed link for its QR code"
    echo "  build [profile]   build the Android app on Expo: preview (APK for your phone, default) or production (AAB for the Play Store)"
    ;;
esac
