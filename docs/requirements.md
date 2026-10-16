# Requirements

This document lists what the app must do, as use cases. Each use case becomes one GitHub issue with acceptance criteria, and issues are grouped into milestones. The issue is where the details and discussion live; this file is the overview.

Source plan: messages from [fonteviva.org](https://fonteviva.org/) (724 excerpts in 4 books), shown in a mobile app (Expo, iOS and Android) that runs entirely on the device with no server of our own.

## Constraints

- **No server.** Content is bundled in the app; notifications are local.
- **Works offline** once installed (and once a downloaded language is saved).
- **English is the default language; Portuguese is also bundled.** Other languages are downloaded on demand from this repository.
- **Every message links back** to its original page on fonteviva.org.
- **Content rights** must be confirmed with the site owner before publishing to the stores.

## Milestones

| Milestone | Goal |
|---|---|
| **v1: Daily message** | Someone installs the app and gets one uplifting message every morning, in English or Portuguese. |
| **v2: Personal schedule and more languages** | People choose when and how often they hear from the app, and read it in more languages. |
| **v3: Talk about it** | People can reflect on a message in a conversation (Gemini gem). |

## Use cases

### v1: Daily message

| # | As a reader, I can... | Acceptance criteria (summary) |
|---|---|---|
| UC-01 | **receive a message every day at 6am** | After first launch and permission, a local notification arrives daily at 06:00 device time with the message title and opening line; works with no network; at least ~30 days are queued and topped up each time the app opens. |
| UC-02 | **open today's message from the notification** | Tapping the notification opens that exact message in the reader. |
| UC-03 | **see today's message when I open the app** | The home screen shows today's message (same one the notification announced) with book, chapter, title, body and signature. |
| UC-04 | **ask for another message** | An "Another message" action shows a random message not shown recently. |
| UC-05 | **read the message in English or Portuguese** | The app defaults to English, or Portuguese if the phone is set to Portuguese; the language can be switched in settings, and notifications follow it. |
| UC-06 | **share a message** | Share opens the system share sheet with the message text and the fonteviva.org link. |
| UC-07 | **open the original on fonteviva.org** | Each message has a link that opens its page on the site. |
| UC-08 | **change the notification time** | Settings let me pick the daily time; queued notifications are rescheduled to it. |
| UC-09 | **turn notifications off and on** | A switch in settings cancels or restores the schedule; if the system permission is denied, the app explains how to enable it. |

Supporting work for v1 (issues, not use cases): content export to JSON (PR #1), English translation of all 724 messages with a spot-check, Expo project setup, permission from the site owner, store listings and test builds.

### v2: Personal schedule and more languages

| # | As a reader, I can... | Acceptance criteria (summary) |
|---|---|---|
| UC-10 | **choose which days I get a message** | Pick days of the week (e.g. weekdays only); notifications are scheduled only on those days. |
| UC-11 | **get more than one message a day** | Add more than one time per day; each time gets a different message; iOS's 64 pending-notification limit is respected. |
| UC-12 | **download another language** | Settings list available languages from the repo; choosing one downloads it, saves it on the device, and it then works offline. |
| UC-13 | **keep favourites** | Mark a message as favourite and find it later in a favourites list, stored on the device. |
| UC-14 | **see messages I've already received** | A history list shows past messages by date. |
| UC-15 | **choose which books I hear from** | Turn individual books (Caminho, Verdade e Vida; Fonte Viva; Pão Nosso; Vinha de Luz) on or off. |

### v3: Talk about it

| # | As a reader, I can... | Acceptance criteria (summary) |
|---|---|---|
| UC-16 | **talk about a message with the Fonte Viva gem** | A "Talk about this message" button opens the gem's share link in the Gemini app or browser. |
| UC-17 | **chat about a message inside the app** | (Later, optional) In-app chat using the gem's instructions via Firebase AI Logic; no API key ships in the app. |

## Out of scope for now

- WhatsApp delivery (needs a server and the WhatsApp Business API).
- Server push, accounts, analytics.

## How we work with these

- One GitHub issue per use case, titled `UC-xx: <use case>`, labelled `use-case`, with full acceptance criteria as a checklist, in its milestone.
- Supporting tasks are issues too, labelled `task`.
- A PR that implements a use case references its issue (`Closes #n`). When a use case changes, update its issue and this table together.
