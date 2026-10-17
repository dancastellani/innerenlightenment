# Tech stack

What this project uses, why, and how each piece works, with a small example and how to run it. Items marked **(planned)** are decided but not built yet.

Some files mentioned here arrive with the open PRs: the export script, tests and workflows ([#1](https://github.com/dancastellani/innerenlightenment/pull/1)), the requirements and specs ([#2](https://github.com/dancastellani/innerenlightenment/pull/2)), and the agent guidance ([#3](https://github.com/dancastellani/innerenlightenment/pull/3)).

## The big picture

```
fonteviva.org (WordPress)
   │  export script (TypeScript, run by Node 24, in GitHub Actions)
   ▼
content/pt.json  ──translate once with an LLM──►  content/en.json, content/<lang>.json
   │
   ▼
Expo app on the phone (planned): bundles en + pt, downloads other languages,
schedules local notifications. No server of our own.
```

## TypeScript

TypeScript is JavaScript plus **types**: labels that say what shape a value has. The editor and type checker use them to catch mistakes before the code runs. One language is used everywhere: scripts, tests and the app.

```ts
type Message = { id: number; title: string; paragraphs: string[] };

function firstLine(m: Message): string {
  return m.paragraphs[0] ?? m.title; // ?? means "if the left side is missing, use the right"
}
```

Things you will see in this repo:

- `type X = { ... }` describes an object's fields. `string | null` means "a string, or nothing".
- `export` makes a function or type usable from another file; `import { x } from './file.ts'` uses it.
- `async` / `await` wait for slow things (network, files) without blocking.
- `Promise<T>` is "a `T` that will arrive later", what an `async` function returns.

## Node 24 (runs TypeScript directly)

Node.js runs JavaScript outside the browser. Since version 24, Node runs `.ts` files directly: it **strips the type labels** and runs what is left. There is no build or compile step.

```sh
node scripts/export-fonteviva.ts
```

Two rules come with this:

- Imports include the `.ts` extension: `import { parseMessage } from './parse-message.ts'`.
- Only TypeScript features that can simply be erased are allowed (types, `type` imports). Features that generate code, like `enum`, don't run. Plain objects and string unions do the same job.

Node also ships with what the scripts need, so the scripts have **no dependencies**: `fetch` for HTTP, `node:fs` for files, `node:test` for tests. `package.json` says `"type": "module"`, which turns on `import`/`export`, and lists two development dependencies for the tests: Cucumber, to run the specs, and Playwright, to open the built website in a real browser.

Install: [nodejs.org](https://nodejs.org/), version 24 or newer. Check with `node --version`.

## Tests with `node --test`

Node has a built-in test runner. A test file imports `test` and `assert`, and each test checks a result.

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toText } from './parse-message.ts';

test('decodes entities', () => {
  assert.equal(toText('p&atilde;o'), 'pão');
});
```

Run them all:

```sh
node --test scripts/*.test.ts
```

A passing run prints `pass` for each test; a failing one shows what was expected and what came out.

## The content export and the fonteviva.org API

fonteviva.org is a WordPress site, and WordPress has a public **REST API**: URLs that return data as JSON instead of web pages.

- `https://fonteviva.org/wp-json/wp/v2/categories` lists the 4 books.
- `https://fonteviva.org/wp-json/wp/v2/posts?per_page=100&page=1` returns 100 messages at a time. The `X-WP-TotalPages` response header says how many pages there are.

The export has two files in `scripts/`:

- `export-fonteviva.ts` fetches every page of categories and posts, then writes `content/pt.json`.
- `parse-message.ts` turns one post's HTML into clean fields. The site's HTML uses consistent classes (`.capitulo` chapter, `.espirito` spirit, `.autor` medium, `.assinatura` signature), so a few regular expressions are enough, with no HTML library.

One message in `content/pt.json` looks like:

```json
{
 "id": 1485,
 "slug": "brilhe-vossa-luz",
 "url": "https://fonteviva.org/vinha-de-luz/brilhe-vossa-luz/",
 "book": "vinha-de-luz",
 "title": "Brilhe vossa luz",
 "chapter": "Prefácio",
 "spirit": "Emmanuel",
 "medium": "Francisco Cândido Xavier",
 "paragraphs": ["Primeiro parágrafo...", "..."],
 "signature": "Emmanuel",
 "note": "Pedro Leopoldo, 25 de novembro de 1951."
}
```

Run it locally:

```sh
node scripts/export-fonteviva.ts            # writes content/pt.json
node scripts/export-fonteviva.ts out.json   # or another path
```

Progress goes to the terminal (`posts: page 3/8`). The content is static, so the export only needs re-running occasionally.

## GitHub Actions

GitHub Actions runs jobs on GitHub's machines, described by YAML files in `.github/workflows/`.

- **Test** (`test.yml`) runs `node --test` on every pull request and every push to `main`. The PR page shows a green check or a red cross.
- **Export messages** (`export-content.yml`) is started by hand from the **Actions** tab ("Run workflow"). It runs the export and, if `content/pt.json` changed, opens a PR with the new file. It exists because the export can't reach fonteviva.org from every environment, but it always works from GitHub.
- **Translate messages** (`translate-content.yml`) is also started by hand, with a language code. It runs `scripts/translate.ts` with the `GEMINI_API_KEY` secret and opens a PR with `content/<lang>.json`.

A workflow is a list of steps:

```yaml
steps:
  - uses: actions/checkout@v4      # get the code
  - uses: actions/setup-node@v4    # install Node
    with:
      node-version: 24
  - run: node --test scripts/*.test.ts
```

## Specs in plain English (Gherkin)

Each use case has a `.feature` file in `specs/` written in **Gherkin**: plain-English scenarios in a fixed Given / When / Then shape. They are the acceptance criteria, and later they are the tests.

```gherkin
@UC-01 @v1
Feature: Receive a message every day at 8am

  @UC-01.4
  Scenario: Queue is topped up when the app opens
    Given only 5 notifications remain scheduled
    When I open the app
    Then notifications are scheduled for the next 14 days
```

- `Given` sets up the situation, `When` is the action, `Then` is what must be true.
- Tags like `@UC-01.4` are **stable scenario IDs**. They are never renumbered or reused, so issues, tests and reports can point at them.
- One GitHub issue per use case (`UC-01: ...`) lists its scenario IDs as a checklist. See `docs/requirements.md`.

### Running specs with Cucumber

[Cucumber](https://github.com/cucumber/cucumber-js) reads the `.feature` files and runs them. For each Given/When/Then line it finds a matching TypeScript function, a **step definition**, and calls it. A scenario passes when all of its steps pass.

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';

Given('only {int} notifications remain scheduled', function (count: number) {
  this.scheduled = count; // set up the fake phone state
});

When('I open the app', function () {
  this.scheduled = topUp(this.scheduled); // the real app logic under test
});

Then('notifications are scheduled for the next {int} days', function (days: number) {
  assert.equal(this.scheduled, days);
});
```

`{int}` captures a number from the sentence, so one step definition serves every scenario that uses the same wording. `this` is shared between the steps of one scenario. Step definitions are written along with the code each scenario covers. The operational specs in `specs/ops/` (export, `run.sh`, CI checks) already run this way, as part of `./run.sh test` (after `./run.sh setup`) and on every PR. Results are reported by tag (`@OP-01.1`). Flows that need a real phone, like tapping a notification, may later use an on-device tool such as Maestro, still named by scenario ID.

## The app: Expo and React Native (planned)

**React Native** builds iOS and Android apps from one TypeScript codebase. A screen is a function that returns what to show:

```tsx
import { Text, View } from 'react-native';

export default function TodayScreen() {
  return (
    <View>
      <Text>Brilhe vossa luz</Text>
    </View>
  );
}
```

**Expo** is the toolkit around React Native: it creates the project, runs it on your phone, and provides ready modules (notifications, sharing, storage). During development you scan a QR code with the **Expo Go** app to run the app on your phone; store builds come later (TestFlight on iPhone, internal testing on Google Play).

```sh
npx expo start   # then scan the QR code with Expo Go
```

Everything runs on the phone: there is **no server** of our own.

### PR previews in Expo Go (EAS Update)

**EAS Update** is Expo's hosting for app bundles (the JavaScript and assets, not a full app). Each PR is published to its own update branch, and scanning its QR code with Expo Go opens that PR's version of the app, so several open PRs can be tried side by side. Nothing reaches users: a store build only receives updates from the channel it was built for, and previews never go there.

Previews are published by hand from a laptop with `./run.sh preview` ([steps](development.md#previewing-an-app-pr-in-expo-go)), so no Expo token is stored in GitHub. It runs `eas update --branch preview-<git branch>` in `mobile/`, which prints a link to the update on expo.dev with the QR code.

The *Expo preview* Action (`.github/workflows/expo-preview.yml`) can do this on every PR and comment the QR code, but it is turned off (`if: false`) because it needs an Expo access token as a GitHub secret. To turn it on, remove that line and do step 3 below.

One-time setup, already done for this repo (except step 3):

1. Sign up at [expo.dev/signup](https://expo.dev/signup) (Google sign-in works) and create a project named `innerenlightenmentapp`.
2. Link the app to it: `cd mobile && npx eas-cli@latest init --id <project id>`. This writes the ID into `mobile/app.json` (`extra.eas.projectId`); the app also needs `updates.url` (`https://u.expo.dev/<project id>`), `runtimeVersion` (`{ "policy": "sdkVersion" }`, which matches Expo Go) and the `expo-updates` package.
3. Create an access token at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) and save it as the repository secret `EXPO_TOKEN` (Settings → Secrets and variables → Actions). Only needed for the Action.

### Local notifications (planned)

`expo-notifications` asks the phone to show a notification at a set time, even with the app closed and no network. The text is fixed when the notification is scheduled, so the app picks the next 14 messages and schedules one per day at 8:00. Each time the app opens, it tops the queue back up to 14 days (iOS allows at most 64 pending notifications). Tapping one opens that message.

```ts
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: { title: message.title, body: message.paragraphs[0], data: { id: message.id } },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: tomorrowAt6 },
});
```

Settings (time, on/off, language) and the message planned for each upcoming day are saved on the phone.

## Languages (planned)

- Messages are translated **once**, offline, by a script that uses an LLM (Claude or Gemini), and a person spot-checks a sample. Each language is one file: `content/en.json`, `content/pt.json`, and so on, with the same shape.
- **English (the default) and Portuguese are bundled** inside the app, so they work offline from the first launch.
- Other languages are **downloaded on demand** from this GitHub repository and saved on the phone, so they work offline afterwards.
- There is no API key in the app and no runtime translation.

## Licensing

- **Code:** [PolyForm Noncommercial 1.0.0](../LICENSE.md). Anyone may use, copy and change it for noncommercial purposes, keeping the notice; commercial use is not allowed.
- **Messages in `content/`:** not covered by the code license. They are excerpts from books by Emmanuel / Francisco Cândido Xavier as published on fonteviva.org, and their translations; the rights stay with their holders. Permission from the site owner (and possibly the publisher, FEB) must be confirmed before publishing the app to the stores.

## Working agreements

- Make the minimal change and the simplest code that works; prefer the standard library and fewer dependencies (`CLAUDE.md`, `AGENTS.md`).
- A PR that changes behaviour updates its spec in `specs/` in the same PR and references its issue.

## Quick reference

The everyday commands are in [`run.sh`](development.md#runsh). The GitHub workflows are in [Updating the messages](development.md#updating-the-messages) and [Translating the messages](development.md#translating-the-messages).
