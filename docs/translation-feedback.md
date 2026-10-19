# Reporting translation errors (UC-21)

Parent issue: #151. Readers report a mistake in a translated message from the app and the website; reports reach us and become fixes in `content/<lang>/messages.json`.

## Options compared

| Option | Cost | Reporter needs | Secrets | Verdict |
|---|---|---|---|---|
| Prefilled GitHub issue link (no backend) | Free | A GitHub account | None | Too hard for most readers |
| Google Form / Sheet | Free | Nothing | None | Works, but reports live outside our issue tracker and the form can't be styled like the app |
| **Cloudflare Worker that opens a GitHub issue** | Free tier (100k requests a day) | Nothing | GitHub token in the Worker only | **Recommended** |
| Firebase (Firestore) | Free tier | Nothing | Public app config; needs App Check against abuse | More setup than we need |

## Recommended design

- One small TypeScript Worker (`backend/`), one endpoint: `POST {language, messageId, paragraph?, comment, suggestion?}`.
- It validates the fields and their lengths, limits requests per IP, and opens an issue labelled `translation-error` titled `<language> <messageId>: <short comment>`.
- The fine-grained GitHub token (Issues: write, this repo only) is a Worker secret. The app and website only know the Worker URL, which is not secret.
- No personal data is collected (no email, no account). Reports are public issues, like the messages themselves.
- App and website send the same request, so both read the URL from one place (`content/languages.json` neighbour, decided when built).

## From reports to translation fixes

1. Reports appear as issues labelled `translation-error`.
2. We review each against the Portuguese original. A valid one is fixed in `content/<lang>/messages.json`, in a data-only PR saying `Fixes #<n>` (the translate script skips ids already done, so manual fixes are kept).
3. A report about Portuguese is never edited in `pt/messages.json`; it is fixed in how the text is shown, or passed to the source.
4. Rejected reports are closed with the reason.

## Needs Dan

A free Cloudflare account and the GitHub token (nothing costs money). Everything else can be built without them, using a local stub of the endpoint in tests.
