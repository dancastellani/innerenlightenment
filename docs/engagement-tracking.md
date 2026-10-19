# Engagement tracking

Plan for [#163](https://github.com/dancastellani/innerenlightenment/issues/163). Goal: know whether people use the app and the website, and which features and languages, without knowing who they are. The audience is privacy-minded, so counts are anonymous and aggregate.

## What we count

A fixed list of events, each a count per day, event name and language. Nothing else is stored.

| Event | Where | Answers |
|---|---|---|
| `app_opened` (with `age`) / `page_viewed` | app / website | How many people come, per day, and whether they come back |
| `message_viewed` | both | Is the daily message read (from a notification or on opening) |
| `another_message` | both | Do people want more than one |
| `shared` | both | Do people pass messages on |
| `original_opened` | both | Do study groups compare with the Portuguese |
| `language_changed` | both | Which languages matter (the `language` field) |
| `notifications_on` / `notifications_off` | app | Does the daily notification keep people |

## What we never collect

No user id, device id, cookie, IP address, message text or free text.

### Retention without an id

The app keeps the date of its first launch on the phone only. Each `app_opened` carries `age`, the days since that first launch, rounded to a bucket (`0`, `1`, `2-6`, `7-29`, `30+`). The Worker counts per day, event, language and `age`, so "how many opens came from people who installed 7 or more days ago" is a sum over rows, with no way to tell which opens came from the same person. It shows if people come back, not which person. The website has no install date, so it has no retention, only visits.

## Options compared

Order of comparison: security, UX, cost, maintenance, scaling.

| Option | Security / privacy | UX | Cost | Maintenance | Verdict |
|---|---|---|---|---|---|
| **Our Cloudflare Worker counts events** (Analytics Engine) | Best: we decide what is stored; no third-party SDK in the app | Invisible | Free tier, already needed for feedback (#152) | One more route in a Worker we already have | **Recommended** |
| Firebase / Google Analytics | Ids and Google SDK; fails the privacy bar | Invisible | Free | SDK upgrades with each Expo SDK | No |
| PostHog / Plausible / GoatCounter | Good for the website; mobile SDKs are heavier | Invisible | Free tier or paid | A new account and service | Only if the Worker proves too limited |
| Play Console statistics only | Nothing to add | None | Free | None | Installs and crashes only; add it anyway after release |

Using one endpoint for the app and the website gives the same events in one place, which keeps feature parity.

## Consent and privacy

- Counts are anonymous and aggregate, so no consent banner. Still: a **Settings switch** in the app and an **opt-out link** on the website (also honouring Do Not Track), both on by default and stated in the privacy policy.
- The Worker does not store the IP address. Cloudflare sees it in transit, as for any request.
- Failures and offline are silent; tracking never slows or blocks the app.
- **Play Data safety** (docs/play-store.md currently says "collects nothing"): must change to "App activity: app interactions, collected, not linked to the user, optional". Tracked in #167 and must land before the first release.

## Reading the numbers

Dan queries the Analytics Engine with Cloudflare's SQL API or dashboard (OP-07). A weekly summary in a GitHub Action is possible later; not planned now.

## Order of work

1. #164 Worker endpoint (needs Dan's Cloudflare account, shared with #152)
2. #165 app and #166 website, in parallel
3. #167 privacy policy and Data safety

## To confirm before building

Cloudflare Analytics Engine limits on the free plan and its retention (about 3 months) should be checked when #164 starts.
