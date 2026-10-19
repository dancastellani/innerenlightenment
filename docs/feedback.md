# Sending feedback (UC-21)

Parent issue: #151. Readers send feedback from the app and the website. The feature is generic: every report has a **type**, and only `translation` (a mistake in a translated message) exists for now. More types (a wrong message, a suggestion, a bug) are added later by adding a type, not a new backend. Translation reports become fixes in `content/<lang>/messages.json`.

## Options compared

| Option | Cost | Reporter needs | Secrets | Verdict |
|---|---|---|---|---|
| Prefilled GitHub issue link (no backend) | Free | A GitHub account | None | Too hard for most readers |
| Google Form / Sheet | Free | Nothing | None | Works, but reports live outside our issue tracker and the form can't be styled like the app |
| **Cloudflare Worker that opens a GitHub issue** | Free tier (100k requests a day) | Nothing | GitHub token in the Worker only | **Recommended** |
| Firebase (Firestore) | Free tier | Nothing | Public app config; needs App Check against abuse | More setup than we need |

## Recommended design

- One small TypeScript Worker (`backend/`), one endpoint: `POST {type, messageId?, language?, paragraph?, comment, suggestion?}`; `type` is one of a list the Worker allows (now only `translation`, which also requires `language` and `messageId`).
- It validates the fields and their lengths, limits requests per IP, and opens an issue labelled `feedback` and `feedback:<type>` (for example `feedback:translation`), titled `<type> <language> <messageId>: <short comment>`.
- The fine-grained GitHub token (Issues: write, this repo only) is a Worker secret. The app and website only know the Worker URL, which is not secret.
- No personal data is collected (no email, no account). Reports are public issues, like the messages themselves.
- App and website send the same request, so both read the URL from one place (`content/languages.json` neighbour, decided when built).

## From reports to translation fixes

1. Translation reports appear as issues labelled `feedback:translation`.
2. We review each against the Portuguese original. A valid one is fixed in `content/<lang>/messages.json`, in a data-only PR saying `Fixes #<n>` (the translate script skips ids already done, so manual fixes are kept).
3. A report about Portuguese is never edited in `pt/messages.json`; it is fixed in how the text is shown, or passed to the source.
4. Rejected reports are closed with the reason.

## Adding a type later

Add it to the Worker's list of types and to `labels.json` (its form text); the app and website show the entry points they are given. No new backend.

## Needs Dan

A free Cloudflare account and the GitHub token (nothing costs money). Everything else can be built without them, using a local stub of the endpoint in tests.
