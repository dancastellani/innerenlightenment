---
name: update-context
description: Save what was learned in this session to the repo (CLAUDE.md and docs/) so future sessions start with it. Use at the end of a session or when asked to update the context.
---

1. List what this session learned that a future session would otherwise rediscover or have to ask.
2. Read `CLAUDE.md` and the `docs/` files those facts belong to, and add or update them following the "Keeping learnings" rules in `CLAUDE.md`.
3. Check the context as a whole, agent guidance included (`CLAUDE.md`, `.claude/skills/`, `docs/`): remove what is no longer useful, simplify what can be said more simply, and keep each fact in one place only.
4. If nothing changed, say so and stop.
5. Otherwise make the edits on a new branch, open a PR titled "Update project context", and list each change in one line in the PR description.
