# Development

How a change goes from an idea to `main`, and the commands you need along the way.

## Setup

1. Install [Node.js 24](https://nodejs.org/) or newer. Check with `node --version`.
2. Clone the repo: `git clone https://github.com/dancastellani/innerenlightenment.git`
3. Run the tests: `./run.sh test`

There is nothing to install with npm: the scripts only use what ships with Node.

## `run.sh`

`run.sh` is a small shortcut for the commands you use most. It first checks that Node 24 or newer is installed.

| Command | What it does |
|---|---|
| `./run.sh` | Lists the commands |
| `./run.sh test` | Runs the tests (`node --test scripts/*.test.ts`) |
| `./run.sh export` | Downloads all messages from fonteviva.org into `content/pt.json` |

App commands will be added here once the Expo app exists.

## The lifecycle of a change

1. **Issue.** Every feature or bug starts as a GitHub issue that says what should happen. A use case has its spec in `specs/` with scenario IDs like `UC-01.4` (see [tech-stack.md](tech-stack.md#specs-in-plain-english-gherkin)).
2. **Branch.** Work happens on a branch, never directly on `main`: `git switch -c my-change`.
3. **Change and test.** Make the smallest change that does the job, then run `./run.sh test`. A change in behaviour updates its spec in the same branch.
4. **Pull request.** Push the branch and open a PR that references the issue (`Closes #12`). Claude can do steps 2 to 4 when you ask in the project.
5. **CI.** The **Test** workflow runs on every PR. The PR page shows a green check when the tests pass, or a red cross with the failing output.
6. **Review.** You review the PR on GitHub. Comments on a PR Claude opened are picked up and handled by Claude: it pushes a fix, or replies saying why not. CI runs again after each push.
7. **Merge.** When CI is green and you approve, merge the PR on GitHub. Delete the branch afterwards.

## Updating the messages

The messages rarely change, so the export runs by hand:

- **From GitHub (recommended):** Actions tab → **Export messages** → **Run workflow**. If `content/pt.json` changed, it opens a PR with the new file; review and merge it like any other PR.
- **Locally:** `./run.sh export`, then commit `content/pt.json` on a branch and open a PR. This needs access to fonteviva.org, which some networks block.

## Working with Claude Code locally

You can keep working with Claude on your own computer using [Claude Code](https://code.claude.com/docs):

1. Install it: `npm install -g @anthropic-ai/claude-code` (or follow the install steps on the docs page).
2. Open a terminal in your clone of this repo and run `claude`. Sign in the first time.
3. Claude reads [CLAUDE.md](../CLAUDE.md) on start, so it already knows the project, the rules and this workflow.
4. Ask it to pick up an issue, for example: "Pick up issue #33, make a branch, implement it and open a PR." It runs `./run.sh test` before pushing.
