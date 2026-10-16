---
name: update-context
description: Save what was learned in this session to the repo (CLAUDE.md and docs/) so future sessions start with it. Use at the end of a session or when asked to update the context.
---

1. List what this session learned that a future session would otherwise rediscover or have to ask: decisions and their reason, gotchas, conventions, changed plans. Skip anything the code, specs or git history already show, and anything temporary.
2. Read `CLAUDE.md` and the `docs/` files those facts belong to. Follow the "Keeping learnings" rules in `CLAUDE.md`:
   - Facts every session needs go in `CLAUDE.md`, one or two lines each. Keep it short.
   - Detail goes in the matching `docs/` file, or a new `docs/<topic>.md` linked from `CLAUDE.md`.
   - Update or delete entries that are no longer true rather than adding new ones.
   - Never write secrets, tokens or personal data.
3. If nothing is worth saving, say so and stop.
4. Otherwise make the edits on a new branch, open a PR titled "Update project context", and list each change in one line in the PR description.
