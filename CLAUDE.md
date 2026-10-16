# Guidance for coding agents

- Make the minimal change and write the simplest code that achieves the goal. No speculative features, abstractions, options or dependencies.
- Everything is TypeScript: scripts run directly with Node 24 (`node file.ts`, no build step); the app uses Expo. Keep code plain and readable.
- Agents may post on GitHub with a person's account, so end every comment, review reply and issue comment you post with a signature line: a `---` line, then `_🤖 Claude (AI assistant)_`.

## Project context

- **Goal.** An app that shares uplifting, encouraging messages with people who need them. Owner: Dan (`dancastellani`), who is new to TypeScript and learning it, so write clean, readable code ([Clean Code](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29)), not clever code.
- **Source.** The messages are book excerpts from Spiritism (Christian-based), published in Portuguese on [fonteviva.org](https://fonteviva.org/) by Marcelo Paiva (WordPress API, one deep link per message). Related study-group orgs: innerenlightenment.com, spiritist.us, tssfederation.org. Book content is not covered by the code license.
- **Product.** Android first (maybe iOS and macOS later), built with Expo. Everything runs on the device: no server, local scheduled notifications (daily 6am first, user-chosen time later).
- **Languages.** English (default) and Portuguese are bundled in the app; other languages are downloaded on demand from this repo. Spanish is next, later French, Russian and Korean. Translations are made once with an LLM (Gemini) in GitHub Actions.
- **Website.** GitHub Pages, with a page per message for share links and translation comparison for study groups.

## How work is done

- **Specs.** Each use case has a Gherkin `.feature` file in `specs/` with stable scenario IDs (`UC-xx.y` for the app, `OP-xx.y` for operations) and a linked GitHub issue. Scenarios are meant to run with Cucumber.
- **Lifecycle.** Issue → branch → small change with tests → PR referencing the issue → CI → review → merge. A change in behaviour updates its spec in the same PR.
- **Commands.** `./run.sh test` runs the tests, `./run.sh export` refreshes `content/pt.json` from fonteviva.org.
- **Actions.** *Export messages* refreshes the Portuguese content and opens a PR; translation runs in Actions using the `GEMINI_API_KEY` secret.
- **More detail.** [docs/tech-stack.md](docs/tech-stack.md) explains each technology; [docs/development.md](docs/development.md) covers setup and the lifecycle; [docs/requirements.md](docs/requirements.md) lists the requirements.

## Keeping learnings

Sessions start fresh, so anything worth remembering must live in the repo and land through a normal PR. The `/update-context` skill does this at the end of a session.

- Record only durable, non-obvious facts a future session would otherwise rediscover or ask again: decisions and their reason, gotchas, conventions. Not what the code or git history already shows, and never secrets.
- Keep this file short: only what every session needs. Put detail in the topic file under `docs/` it belongs to (or a new `docs/<topic>.md` linked from here); those are read when needed.
- One or two lines per fact. Update or delete an entry that is no longer true instead of appending a new one.
