# Guidance for coding agents

- Make the minimal change and write the simplest code that achieves the goal. No speculative features, abstractions, options or dependencies.
- Everything is TypeScript: scripts run directly with Node 24 (`node file.ts`, no build step); the app uses Expo. Keep code plain and readable.
- Agents may post on GitHub with a person's account, so end every comment, review reply and issue comment you post with a signature line: a `---` line, then `_🤖 Claude (AI assistant)_`.

## Project context

- **Goal.** An app that shares uplifting, encouraging messages with people who need them. Owner: Dan (`dancastellani`), who is new to TypeScript and learning it, so write clean, readable code ([Clean Code](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29)), not clever code.
- **Source.** The messages are book excerpts from Spiritism (Christian-based), published in Portuguese on [fonteviva.org](https://fonteviva.org/) by Marcelo Paiva (WordPress API, one deep link per message). Related study-group orgs: innerenlightenment.com, spiritist.us, tssfederation.org. Book content is not covered by the code license.
- **Product.** Android first (maybe iOS and macOS later), built with Expo. Everything runs on the device: no server, local scheduled notifications (daily 8am first, user-chosen time later).
- **Languages.** English (default) and Portuguese are bundled in the app; other languages are downloaded on demand from this repo. Spanish and French are translated; Russian and Korean come later. Translations are made once with an LLM (Gemini) in GitHub Actions.
- **Website.** GitHub Pages, with a page per message for share links and translation comparison for study groups. Built by `scripts/build-site.ts` from the templates, stylesheet and labels in `website/`, and published by the *Website* Action on every merge to `main`. Adding a language also needs its name and labels in `website/languages.json` (the build stops without them).

## How work is done

- **Specs.** Each use case has a Gherkin `.feature` file in `specs/` with stable scenario IDs (`UC-xx.y` for the app, `OP-xx.y` for operations) and a linked GitHub issue. Scenarios are meant to run with Cucumber.
- **Tests.** Cover the boundaries, not just the happy path: empty, exactly at a limit, one past it, and running out (Dan asked for this on PR #45).
- **Defects.** Every defect found gets its own GitHub issue labelled `bug`, even when it is fixed right away, and the fixing PR says `Fixes #<n>` (Dan tracks defects).
- **Lifecycle.** Issue → branch → small change with tests → PR referencing the issue → CI → review → merge. A change in behaviour updates its spec in the same PR.
- **Edge cases.** Each spec also has boundary and negative scenarios (limits, empty, refused, offline, clock and time zone changes); how to write them is in [docs/development.md](docs/development.md#edge-cases).
- **Screenshots.** A PR that changes the UI (app or website) shows every changed screen: commit phone-sized screenshots to `docs/screenshots/` and embed them under an *Evidence* section in the PR description, naming the scenario IDs each one shows. For the app, the web build (`npx expo export -p web`) in headless Chromium is enough; say what web can't show (real notifications).
- **Commands.** `npm run` lists them all (npm scripts that call `run.sh`, Dan's choice for discoverability). `./run.sh setup` installs the packages, `./run.sh test` runs the tests, `./run.sh export` refreshes `content/pt.json` from fonteviva.org, `./run.sh translate <lang>` writes `content/<lang>.json` with Gemini, `./run.sh preview` publishes the checked-out branch for Expo Go (no QR on PRs: no Expo token in GitHub), `./run.sh build [preview|production]` builds the Android APK or Play Store AAB on Expo's servers, from Dan's laptop.
- **Actions.** *Export messages* refreshes the Portuguese content and opens a PR; translation runs in Actions using the `GEMINI_API_KEY` secret.
- **More detail.** [docs/tech-stack.md](docs/tech-stack.md) explains each technology; [docs/play-store.md](docs/play-store.md) lists the Google Play steps; [docs/development.md](docs/development.md) covers setup and the lifecycle; [docs/requirements.md](docs/requirements.md) lists the requirements.

## Keeping learnings

Sessions start fresh, so anything worth remembering must live in the repo and land through a normal PR. The `/update-context` skill does this at the end of a session.

- Record only durable, non-obvious facts a future session would otherwise rediscover or ask again: decisions and their reason, gotchas, conventions. Not what the code or git history already shows, and never secrets.
- Keep this file short: only what every session needs. Put detail in the topic file under `docs/` it belongs to (or a new `docs/<topic>.md` linked from here); those are read when needed.
- One or two lines per fact. Update or delete an entry that is no longer true instead of appending a new one.
