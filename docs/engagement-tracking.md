# Engagement tracking

Plan for [#163](https://github.com/dancastellani/innerenlightenment/issues/163). Goal: know whether people use the app and the website, and which features and languages, without knowing who they are. The audience is privacy-minded, so counts are anonymous and aggregate.

## What we count

A fixed list of events, each a count per day, event name, language, platform and country. Nothing else is stored.

| Event | Where | Answers |
|---|---|---|
| `app_opened` (with `age`) / `page_viewed` | app / website | How many people come, per day, and whether they come back |
| `message_viewed` | both | Is the daily message read (from a notification or on opening) |
| `another_message` | both | Do people want more than one |
| `shared` | both | Do people pass messages on |
| `original_opened` | both | Do study groups compare with the Portuguese |
| `language_changed` | both | Which languages matter (the `language` field) |
| `notifications_on` / `notifications_off` | app | Does the daily notification keep people |
| `error` (with a fixed `code`) | both | What breaks for people, so we fix it before they report it |

### Dimensions on every event

- **Platform:** `app` or `web`, so the app and website are always told apart. For the app: OS and OS major version (e.g. `android 15`) and app version. For the website: browser family and OS family (e.g. `chrome`, `windows`), read from the browser's `User-Agent` by the Worker, which keeps only these coarse names and drops the rest of the header.
- **Country:** yes, country only (e.g. `BR`, `US`). Cloudflare gives it to the Worker for each request, so the app and the website send nothing extra and the IP address is still not stored. No region or city: with few users, a city plus OS plus language could single a person out.

### Errors

Yes. The app and the website catch uncaught errors and send an `error` event with a code from a fixed list (for example `language_download_failed`, `notification_schedule_failed`, `message_load_failed`, `uncaught`) plus the platform dimensions above. Never the error message or stack trace, which can contain text. Counting codes per app version and OS tells us what to fix first. For stack traces of crashes, Google Play Console shows Android crashes and "app not responding" reports for free once the app is in the store; a crash-report service (Sentry or similar) is a later option if the counts are not enough.

## What we never collect

No user id, device id, cookie, IP address, message text or free text.

### Retention without an id

The app keeps the date of its first launch on the phone only. Each `app_opened` carries `age`, the days since that first launch, rounded to a bucket (`0`, `1`, `2-6`, `7-29`, `30+`). The Worker counts per day, event, language and `age`, so "how many opens came from people who installed 7 or more days ago" is a sum over rows, with no way to tell which opens came from the same person. It shows if people come back, not which person. The website has no install date, so it has no retention, only visits.

## Options compared

Order of comparison: security, UX, cost, maintenance, scaling.

| Option | Security / privacy | UX | Cost | Maintenance | Verdict |
|---|---|---|---|---|---|
| **Our Cloudflare Worker counts events** (Analytics Engine) | Best: we decide what is stored; no third-party SDK in the app | Invisible | Free tier, already needed for feedback (#152) | One more route in a Worker we already have | **Recommended** |
| Firebase / Google Analytics | Fails the privacy bar: see "Why not Google" below | Invisible | Free | SDK upgrades with each Expo SDK | No |
| PostHog / Plausible / GoatCounter | Good for the website; mobile SDKs are heavier | Invisible | Free tier or paid | A new account and service | Only if the Worker proves too limited |
| Play Console statistics only | Nothing to add | None | Free | None | Installs and crashes only; add it anyway after release |

Using one endpoint for the app and the website gives the same events in one place, which keeps feature parity.

### Why not Google

- It assigns each phone an id (and can use the advertising id), so one person is followed across days, apps and websites, and the data is held by Google, who can combine it with what it knows about the account.
- Play's Data safety form would have to say "collected and shared with a third party", and in Europe it needs a consent banner before any counting. Cookies and ids are what the banner is for.
- Using an app of Spiritist readings can reveal a person's religious belief, which the GDPR treats as especially sensitive data. For this audience even the appearance of profiling is a cost, and anonymous counts keep us outside it.
- Its SDK is native code that must follow every Expo SDK upgrade, which is a maintenance cost for Dan.

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
