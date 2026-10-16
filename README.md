# innerenlightenment

A mobile app that brings a daily uplifting message to the people who need it, starting with the messages published on [fonteviva.org](https://fonteviva.org/).

## Status

Early setup. The plan:

- **Content:** all messages from fonteviva.org, exported to JSON (`content/pt.json`) through the site's public WordPress REST API.
- **App:** Expo (React Native) for iOS and Android, running entirely on the phone with no server. Daily messages arrive as local notifications at a time the user picks (6am by default).
- **Languages:** messages are translated once and stored as one file per language (`content/<lang>.json`). English and Portuguese ship with the app; other languages download from this repository on demand.
- **Later:** a link to chat about the message with a Gemini gem, and per-user frequency.

## Exporting the messages

```sh
npm run export:pt   # writes content/pt.json
npm test            # parser tests
```

Or run the **Export messages** workflow from the Actions tab, which opens a PR with the updated file.

## License

The code is licensed under the [MIT License](LICENSE).

The messages in `content/` are **not** covered by that license. They are excerpts from books by Emmanuel, psychographed by Francisco Cândido Xavier, as published on [fonteviva.org](https://fonteviva.org/), and their translations. All rights to that content remain with its rights holders.
