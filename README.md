# innerenlightenment

[![Test](https://github.com/dancastellani/innerenlightenment/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/dancastellani/innerenlightenment/actions/workflows/test.yml?query=branch%3Amain)

A mobile app that brings a daily uplifting message to the people who need it, starting with the messages published on [fonteviva.org](https://fonteviva.org/).

**Read the messages on the website:** https://dancastellani.github.io/innerenlightenment/ (English, Portuguese, Spanish and French; no app needed). It is published from `main` on every merge.

## Background

The messages come from Spiritism, a Christian-based philosophy, science, and religion. They are excerpts from books by the spirit Emmanuel, received by the medium Francisco Cândido Xavier. To learn more or join a study group (in person or online):

- [innerenlightenment.com](https://www.innerenlightenment.com/)
- [spiritist.us](https://spiritist.us/)
- [tssfederation.org](https://www.tssfederation.org/)

## Status

Early setup. The plan:

- **Content:** all messages from fonteviva.org, exported to JSON (`content/pt/messages.json`) through the site's public WordPress REST API.
- **App:** Expo (React Native) for iOS and Android, running entirely on the phone with no server. Daily messages arrive as local notifications at a time the user picks (8am by default).
- **Website:** one page per message, in every language, at https://dancastellani.github.io/innerenlightenment/, built by `scripts/build-site.ts` and published with GitHub Pages.
- **Languages:** messages are translated once and stored as a folder per language (`content/<lang>/` with `messages.json` and `labels.json`). English and Portuguese ship with the app; other languages download from this repository on demand.
- **Later:** a link to chat about the message with a Gemini gem, and per-user frequency.

## Acknowledgements

Thank you to **Marcelo Paiva**, creator and maintainer of [fonteviva.org](https://fonteviva.org/), whose work collecting and publishing these messages makes this project possible.

## Development

Run `npm run setup` once, then `npm run` to see all commands (tests, previews, Android builds, export, translation). See [docs/development.md](docs/development.md) for setup, the commands, and how a change goes from issue to merge.

## Exporting the messages

Scripts are TypeScript with no dependencies. Install [Node.js 24](https://nodejs.org/), which runs `.ts` files directly:

```sh
npm test                  # tests and specs
npm run export-messages   # writes content/pt/messages.json
```

Or run the **Export messages** workflow from the Actions tab, which opens a PR with the updated file. The **Translate messages** workflow does the same for `content/<lang>/messages.json` (see [docs/development.md](docs/development.md#translating-the-messages)).

## License

The code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE.md): you may use, copy and change it for any noncommercial purpose, keeping the copyright notice. Commercial use is not permitted. The software comes with no warranty or liability.

The messages in `content/` are **not** covered by that license. They are excerpts from books by Emmanuel, psychographed by Francisco Cândido Xavier, as published on [fonteviva.org](https://fonteviva.org/), and their translations. All rights to that content remain with its rights holders.

**Disclaimer:** the messages come from publicly available data on fonteviva.org. This project is not responsible or liable for the content of the messages.
