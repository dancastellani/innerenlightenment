# Sending feedback (UC-21)

Parent issue: #151. Readers send feedback from the app and the website. The feature is generic: every report has a **type**, and only `translation` (a mistake in a translated message) exists for now. More types (a wrong message, a suggestion, a bug) are added later by adding a type, not a new backend. Translation reports become fixes in `content/<lang>/messages.json`.

## Options compared

Criteria, in order of importance (Dan, 2026-10-19): security, UX, cost, maintenance, scaling.

| | Security | UX | Cost | Maintenance | Scaling |
|---|---|---|---|---|---|
| **A. Cloudflare Worker → GitHub issue** | Token only in the Worker; input checked in code; per-IP rate limit; public issues, so no private data may be asked | Reporter: no account, one form. Us: reports are issues, in our workflow | Free (100k requests a day) | ~40 lines of our code plus one secret to rotate | Plenty; but many issues clutter the tracker and GitHub limits issue creation |
| **B. Supabase (table, direct insert)** | Public key in the app by design; safe only if the table rule is insert-only with column checks; no per-IP limit without an Edge Function | Reporter: same. Us: dashboard and queries, but outside the issue tracker (needs a sync Action) | Free tier (about 500 MB) | No server code, but SQL rules to keep right; free project pauses after a week of no activity | Best: a real database for counts and many types |
| C. Google Form / Sheet | Google handles it; spam control is weak; form is public | Reporter: leaves the app for a Google page | Free | No code; a manual export | Fine at small scale |
| D. Prefilled GitHub issue link | Nothing to secure | Reporter needs a GitHub account: worst | Free | None | Fine |
| E. Firebase (Firestore) | Public config; needs App Check against abuse | Same as B | Free tier | More setup than B | Good |

Verdict by criteria: A leads on security (rate limit, validation in code) and UX for us; B leads only on scaling, and loses on security (no rate limit) and maintenance (pausing). **Recommend A.** Switch to B if feedback grows beyond what an issue tracker handles. The table is from general knowledge; free-tier limits are not checked against the vendors' sites.

## Recommended design

- One small TypeScript Worker (`backend/`), one endpoint: `POST {type, messageId?, language?, paragraph?, comment, suggestion?}`; `type` is one of a list the Worker allows (now only `translation`, which also requires `language` and `messageId`).
- It validates the fields and their lengths, limits requests per IP, and opens an issue labelled `feedback` and `feedback:<type>` (for example `feedback:translation`), titled `<type> <language> <messageId>: <short comment>`.
- The fine-grained GitHub token (Issues: write, this repo only) is a Worker secret. The app and website only know the Worker URL, which is not secret.
- No personal data is collected (no email, no account). Reports are public issues, like the messages themselves.
- App and website send the same request, so both read the URL from one place (`content/languages.json` neighbour, decided when built).

## Supabase in more detail

- A `feedback` table (`type`, `language`, `message_id`, `paragraph`, `comment`, `suggestion`, `created_at`). The app and website insert rows straight through Supabase's REST API with the public key; no Worker.
- Row Level Security allows insert only for everyone (nobody can read or change rows with the public key), and column checks enforce the type list and the 1000-character limit. Reading is for us, in the Supabase dashboard or with the secret key.
- Weak spots: no per-IP rate limit without an Edge Function (Supabase's serverless code), which brings back server code; and a week of no reports pauses the free project, which suits a rarely used form badly.
- To get reports into the repo workflow, a scheduled GitHub Action would read new rows (secret key stored as a repo secret) and open `feedback:<type>` issues, so the rest of this plan stays the same.

## From reports to translation fixes

1. Translation reports appear as issues labelled `feedback:translation`.
2. We review each against the Portuguese original. A valid one is fixed in `content/<lang>/messages.json`, in a data-only PR saying `Fixes #<n>` (the translate script skips ids already done, so manual fixes are kept).
3. A report about Portuguese is never edited in `pt/messages.json`; it is fixed in how the text is shown, or passed to the source.
4. Rejected reports are closed with the reason.

## Adding a type later

Add it to the Worker's list of types and to `labels.json` (its form text); the app and website show the entry points they are given. No new backend.

## Needs Dan

A free Cloudflare account and the GitHub token (nothing costs money). Everything else can be built without them, using a local stub of the endpoint in tests.
