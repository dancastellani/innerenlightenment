# Development

How a change goes from an idea to `main`, and the commands you need along the way.

## Setup

1. Install [Node.js 24](https://nodejs.org/) or newer. Check with `node --version`. With [nvm](https://github.com/nvm-sh/nvm), `nvm use` picks the version in `.nvmrc`.
2. Clone the repo: `git clone https://github.com/dancastellani/innerenlightenment.git`
3. Install the packages: `npm run setup`. It runs `npm ci` at the root (Cucumber, for the specs) and in `mobile/` (the app).
4. Run the tests and the specs: `npm test`
5. For previews and app builds, sign in to Expo once: `npx eas-cli@latest login`.

The scripts themselves only use what ships with Node. The tests have two development dependencies: Cucumber runs the specs, and [Playwright](https://playwright.dev/) (`playwright-core`, the library without browser downloads) opens the built website in your installed Google Chrome for the website specs that need a browser. Install [Google Chrome](https://www.google.com/chrome/) if you don't have it; GitHub's test machines already do. To use another Chrome or Chromium, set `CHROME_PATH` to its executable. `mobile/.npmrc` lets the two eas-cli packages that need install scripts run them (newer npm blocks them by default), so you don't have to change your own npm settings.

## `run.sh`

**Run `npm run` to see all commands.** Each one is an npm script in `package.json` that calls `run.sh`, so `npm run preview` and `./run.sh preview` do the same thing. Pass extra arguments after `--`, for example `npm run translate-messages -- es`.

`run.sh` is where the commands live. It first checks that Node 24 or newer is installed.

| npm script | Same as |
|---|---|
| `npm run setup` | `./run.sh setup` |
| `npm test` | `./run.sh test` |
| `npm run app` | `./run.sh app` |
| `npm run preview` | `./run.sh preview` |
| `npm run build-apk` | `./run.sh build preview` |
| `npm run build-play-store` | `./run.sh build production` |
| `npm run export-messages` | `./run.sh export` |
| `npm run translate-messages -- <lang>` | `./run.sh translate <lang>` |

| Command | What it does |
|---|---|
| `./run.sh` | Lists the commands |
| `./run.sh setup` | Installs the packages for the tests and the app (`npm ci` at the root and in `mobile/`) |
| `./run.sh test` | Runs the tests (`node --test scripts/*.test.ts mobile/*.test.ts`), then the specs in `specs/ops/` with Cucumber |
| `./run.sh export` | Downloads all messages from fonteviva.org into `content/pt.json` |
| `./run.sh translate [lang]` | Translates `content/pt.json` into `content/<lang>.json` (default `en`) with Gemini; needs `GEMINI_API_KEY` |
| `./run.sh site` | Builds the website from `content/` into `site/` |
| `./run.sh app` | Installs the app's packages and starts it; scan the QR code with Expo Go |
| `./run.sh preview` | Publishes the checked-out branch to Expo (EAS Update) as `preview-<branch>`; open the printed link for its QR code |
| `./run.sh build [profile]` | Builds the Android app on Expo's servers (EAS Build): `preview` (default) makes an APK to install on a phone, `production` makes an AAB for the Play Store |

## Trying the app on your Android phone

1. Install **Expo Go** from the Play Store.
2. On your computer, run `./run.sh app`. The first run installs packages, which takes a minute.
3. Open Expo Go and scan the QR code shown in the terminal. Phone and computer must be on the same Wi-Fi; if they can't be, stop it and run `cd mobile && npx expo start --tunnel` instead.
4. Allow notifications when asked. The app shows today's message and schedules the next 14 days at 08:00 (change the time under **Settings**).
5. Open **Settings** and tap **Test notification in 10 seconds**, lock the phone or switch apps, and wait for it. Tap the notification and the app opens on that message.

## The lifecycle of a change

1. **Issue.** Every feature or bug starts as a GitHub issue that says what should happen. A use case has its spec in `specs/` with scenario IDs like `UC-01.4` (see [tech-stack.md](tech-stack.md#specs-in-plain-english-gherkin)).
2. **Branch.** Work happens on a branch, never directly on `main`: `git switch -c my-change`.
3. **Change and test.** Make the smallest change that does the job, then run `./run.sh test`. A change in behaviour updates its spec in the same branch.
4. **Pull request.** Push the branch and open a PR that references the issue (`Closes #12`). Claude can do steps 2 to 4 when you ask in the project.
5. **CI.** The **Test** workflow runs the tests and the specs on every PR. The PR page shows a green check when the tests pass, or a red cross with the failing output. The **Checks** tab has a **Test report** check listing every test and spec scenario with its result; the run's **Summary** page shows the full output.
6. **Review.** You review the PR on GitHub. Comments on a PR Claude opened are picked up and handled by Claude: it pushes a fix, or replies saying why not. CI runs again after each push.
7. **Merge.** When CI is green and you approve, merge the PR on GitHub. Delete the branch afterwards.

## Edge cases

Each spec covers the normal case and its edges, under an `# Edge cases` comment at the end of the `.feature` file, with the next free scenario IDs. The app has few inputs, so for each one ask:

- **Boundaries.** The value exactly at each limit and one step past it, on both sides, and check the app still works across the boundary: times 00:00 and 23:59, a time one minute before or after now, the last day of the month or year, a page of exactly 100 posts.
- **Empty and missing.** A message without a signature, a message missing from the content or its translation, a missing header or setting.
- **Refused and cancelled.** Permission denied or its request closed, a picker or share sheet closed, the site or Gemini answering with an error or nonsense. None of these may break the app: it carries on and asks again next time.
- **The phone's world changing.** No network, the phone restarted or switched off in the middle of saving, the app resumed on a new day, daylight saving time, a new time zone. Saved data must never end up half written, and the next app open repairs anything left half done.

Write the expected behaviour, not the current one: when the code does something else, the scenario stays and the defect gets its own issue labelled `bug`. Every bug also gets a regression scenario so it can't come back; put a `# Regression for #<n>: <what went wrong>` comment above it when the scenario alone doesn't say why it is there. Use a `Scenario Outline` with `Examples` when only the value changes, such as 00:00 and 23:59.

## Updating the messages

The messages rarely change, so the export runs by hand:

- **From GitHub (recommended):** Actions tab → **Export messages** → **Run workflow**. If `content/pt.json` changed, it opens a PR with the new file; review and merge it like any other PR.
- **Locally:** `./run.sh export`, then commit `content/pt.json` on a branch and open a PR. This needs access to fonteviva.org, which some networks block.

## Translating the messages

Translations are made once from `content/pt.json` with the Gemini API and saved as `content/<lang>.json`.

- **From GitHub (recommended):** Actions tab → **Translate messages** → **Run workflow**, with the language code (default `en`). It opens a PR with the file; spot-check a few messages and merge. It needs a repository secret named `GEMINI_API_KEY` (Settings → Secrets and variables → Actions), with a free key from [Google AI Studio](https://aistudio.google.com/apikey).
- **Locally:** `GEMINI_API_KEY=... ./run.sh translate en`.

Messages already in the output file are skipped, so if a run stops halfway (for example on the free tier's daily limit), run it again to finish.

Every translation in `content/` is checked against `content/pt.json` by the tests: same messages in the same order, same fields, book, chapter, author, signature and link, same number of paragraphs, a note only where the original has one, no paragraph or note of 5 words or more left in Portuguese (90% of its words the same as the original), and no epigraph more than 1.5 times longer than the original (Gemini sometimes quotes the whole Bible verse). `node scripts/check-translations.ts` prints the full list of problems, which CI also shows on the run's Summary. The check misses things a reader sees, such as book names left in Portuguese in Bible references (Mateus, Hebreus) or a wrong meaning, so read some messages too; each language's review, with its findings and fixes, is kept in [docs/translation-reviews/](translation-reviews/) (for example [en.md](translation-reviews/en.md)).

## The website

`scripts/build-site.ts` turns `content/<lang>.json` into a static site: one page per message at `<lang>/<slug>/` (the slug is fonteviva.org's, the same in every language), a list of messages per language, and `<lang>/random/`, which opens a random message (the "Another message" link). The home page opens a random English message. The look is kept apart from the code in `website/`: HTML templates in `website/templates/` (with `{{name}}` placeholders), `style.css`, and `languages.json`, which holds each language's name and labels (every language but Portuguese also has the `translationDisclaimer` shown on its translated messages); add an entry there when adding a language, or the build stops with `Add "<lang>" to website/languages.json`. The website and the app share one look: a cool paper background, slate ink and a deep teal for links and buttons (colours in `website/style.css` and `colors` in `mobile/App.tsx`; keep them in step), Literata for the message text on the website, and the phone's serif in the app. The **Website** workflow builds it and publishes it with GitHub Pages on every push to `main`; Pages must be set once to Settings → Pages → Source: **GitHub Actions**.

To look at it locally: `./run.sh site`, then `npx serve site` and open the printed address (links end in `/`, so opening the files directly doesn't follow them).

## Previewing an app PR in Expo Go

Each PR that changes the app (`mobile/` or `content/`) gets a comment from Expo with a link to its preview: open it and scan the QR code with Expo Go. The comment comes once the update is published on Expo's servers.

To publish a branch yourself instead (for example one without a PR), from your laptop:

1. Once: `npx eas-cli@latest login` with your Expo account.
2. Check out the branch: `git fetch origin && git switch <branch>`.
3. Run `./run.sh preview`. It publishes that branch as `preview-<branch>` and prints a link to expo.dev; open it and scan the QR code with Expo Go.

### Connecting GitHub to Expo

Done once by Dan, on expo.dev and GitHub, so Expo can run `mobile/.eas/workflows/pr-preview.yml` on PRs. No token is created or stored in GitHub.

1. Check that your GitHub account is linked to Expo: [expo.dev](https://expo.dev) → your avatar → **Account settings** → **Connections** → connect **GitHub** if it isn't.
2. Open the project: [expo.dev](https://expo.dev) → **Projects** → **innerenlightenmentapp** → **Project settings** → **GitHub** (the page `expo.dev/accounts/<your account>/projects/innerenlightenmentapp/github`).
3. Click **Install GitHub app**. On GitHub, pick your account, choose **Only select repositories** → `dancastellani/innerenlightenment`, read the permissions it asks for, and click **Install**.
4. Back on that Expo page, pick `dancastellani/innerenlightenment` in the repository list and click **Connect**.
5. Set **Base directory** to `mobile` (the app isn't at the repository root) and save.

The next PR that changes the app runs the workflow; you can follow it on expo.dev under the project's **Workflows**. How it works, and why it is safe, is in [tech-stack.md](tech-stack.md#pr-previews-in-expo-go-eas-update).

## Installing the app on your Android phone (APK)

This installs the app itself, with its own icon, instead of running it inside Expo Go. The build runs on Expo's servers, so your laptop needs no Android tools.

1. Once: `npx eas-cli@latest login` with your Expo account.
2. Run `npm run build-apk`. The first time it asks to create an Android signing key (keystore): answer yes, and Expo keeps it safe for you. The build takes about 10 to 20 minutes on the free plan and prints a link when it is done.
3. Open that link on your phone (or scan the QR code on its page) and download the APK.
4. Open the file. Android asks to allow installing apps from your browser or files app: allow it, then tap **Install**.

To update it later, build again and install the new APK over the old one; settings and the planned messages are kept. Changes to the app's code only (no new native packages) can also reach the installed APK with `eas update --channel preview` instead of a new build.

`npm install` in `mobile/` reports about 24 vulnerabilities. They are all in Expo's and React Native's build tools on your laptop (Metro, the Expo CLI, the iOS project editor), not in the app on the phone, and npm has no fixed versions for them yet; its suggested `npm audit fix --force` would downgrade Expo by 14 versions, so don't run it. They go away as Expo updates its packages.

Publishing on Google Play is a separate set of steps, most of them done by you: see [play-store.md](play-store.md).

## Working with Claude Code locally

You can keep working with Claude on your own computer using [Claude Code](https://code.claude.com/docs):

1. Install it: `npm install -g @anthropic-ai/claude-code` (or follow the install steps on the docs page).
2. Open a terminal in your clone of this repo and run `claude`. Sign in the first time.
3. Claude reads [CLAUDE.md](../CLAUDE.md) on start, so it already knows the project, the rules and this workflow.
4. Ask it to pick up an issue, for example: "Pick up issue #33, make a branch, implement it and open a PR." It runs `./run.sh test` before pushing.
5. At the end of a session, run `/update-context`. It saves what was learned (decisions, gotchas, conventions) to `CLAUDE.md` or `docs/` in a PR, so the next session starts with it.

Recommended add-ons, installed once on your computer:

- Expo plugin: run `/plugin install expo@claude-plugins-official` inside Claude Code.
- Design plugins: `frontend-design` (look and type of the website and app screens) and `design` (design critique and accessibility checks). `.claude/settings.json` turns both on for this repo; if Claude Code says they are missing, run `/plugin install frontend-design@claude-plugins-official` and `/plugin install design@knowledge-work-plugins`.
- Gemini API skill (for the translation script): run `npx skills add google-gemini/gemini-skills --skill gemini-api-dev --global` in a terminal, then check it shows in `/skills` ([Google's guide](https://ai.google.dev/gemini-api/docs/coding-agents)).
