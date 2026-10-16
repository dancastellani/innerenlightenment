// Builds the static website from content/<lang>.json: one page per message at <lang>/<slug>/
// (the link the app shares), a list of messages per language, and <lang>/random/, which opens
// a random message. The home page opens a random English message.
//
// Usage: node scripts/build-site.ts [content folder] [output folder]

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Message } from './parse-message.ts';

type Content = { language: string; books: { slug: string; name: string }[]; messages: Message[] };

const LANGUAGE_NAMES: Record<string, string> = { pt: 'Português', en: 'English', es: 'Español' };
const ANOTHER_MESSAGE: Record<string, string> = { pt: 'Outra mensagem', en: 'Another message', es: 'Otro mensaje' };

const STYLE = `
  body { font-family: Georgia, serif; max-width: 40rem; margin: 0 auto; padding: 1rem; line-height: 1.6; color: #222; }
  a { color: #2a5d84; }
  nav, footer, .meta, .note { font-family: system-ui, sans-serif; font-size: 0.9rem; color: #555; }
  footer { margin-top: 3rem; border-top: 1px solid #ddd; padding-top: 1rem; }
  .signature { font-style: italic; text-align: right; }
`;

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function languageName(language: string): string {
  return LANGUAGE_NAMES[language] ?? language;
}

function page(language: string, title: string, body: string): string {
  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

const CREDIT = `<p>The messages are published in Portuguese on <a href="https://fonteviva.org/">fonteviva.org</a> by Marcelo Paiva. Thank you for making this possible.</p>
<p>Disclaimer: the messages come from publicly available data on fonteviva.org. This project is not responsible or liable for the content of the messages.</p>`;

// Opens a random message of the content: `prefix` is the path from this page to the language folder.
// Without JavaScript it shows `fallback` instead.
function randomMessagePage(content: Content, prefix: string, fallback: string): string {
  const slugs = JSON.stringify(content.messages.map((m) => m.slug));
  return page(content.language, 'Fonte Viva messages', `
<script>
const slugs = ${slugs};
location.replace('${prefix}' + slugs[Math.floor(Math.random() * slugs.length)] + '/');
</script>
<noscript>${fallback}</noscript>`);
}

// The home page shows a random English message (or of the first language when there is no English).
function homePage(contents: Content[]): string {
  const content = contents.find((c) => c.language === 'en') ?? contents[0];
  const languages = contents.map((c) => `<li><a href="${c.language}/">${languageName(c.language)}</a></li>`).join('\n');
  return randomMessagePage(content, `${content.language}/`, `<h1>Fonte Viva messages</h1>\n<ul>\n${languages}\n</ul>\n<footer>${CREDIT}</footer>`);
}

function languagePage(content: Content): string {
  const books = content.books.map((book) => {
    const links = content.messages
      .filter((m) => m.book === book.slug)
      .map((m) => `<li><a href="${m.slug}/">${escapeHtml(m.title)}</a></li>`)
      .join('\n');
    return `<h2>${escapeHtml(book.name)}</h2>\n<ul>\n${links}\n</ul>`;
  });
  return page(content.language, languageName(content.language), `
<nav><a href="../">Fonte Viva messages</a></nav>
<h1>${languageName(content.language)}</h1>
${books.join('\n')}`);
}

// otherLanguages are the languages that also have this message, for links to the same page in them.
function messagePage(content: Content, message: Message, otherLanguages: string[]): string {
  const book = content.books.find((b) => b.slug === message.book);
  const meta = [book?.name, message.chapter].filter(Boolean).map((text) => escapeHtml(text!)).join(' · ');
  const paragraphs = message.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
  const signature = message.signature ? `<p class="signature">${escapeHtml(message.signature)}</p>` : '';
  const note = message.note ? `<p class="note">${escapeHtml(message.note)}</p>` : '';
  const languages = otherLanguages.map((l) => `<a href="../../${l}/${message.slug}/">${languageName(l)}</a>`).join(' · ');
  return page(content.language, message.title, `
<nav><a href="../random/">${ANOTHER_MESSAGE[content.language] ?? ANOTHER_MESSAGE.en}</a> · <a href="../">${languageName(content.language)}</a>${languages ? ` · ${languages}` : ''}</nav>
<p class="meta">${meta}</p>
<h1>${escapeHtml(message.title)}</h1>
${paragraphs}
${signature}
${note}
<footer>
<p><a href="${escapeHtml(message.url)}">Read it on fonteviva.org</a></p>
${CREDIT}
</footer>`);
}

function readContents(folder: string): Content[] {
  const files = readdirSync(folder).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) throw new Error(`No content files (<lang>.json) in ${folder}`);
  return files.map((f) => JSON.parse(readFileSync(join(folder, f), 'utf8')));
}

function write(file: string, html: string) {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, html);
}

function buildSite(contentFolder: string, outFolder: string) {
  const contents = readContents(contentFolder);
  rmSync(outFolder, { recursive: true, force: true });
  write(join(outFolder, 'index.html'), homePage(contents));
  for (const content of contents) {
    write(join(outFolder, content.language, 'index.html'), languagePage(content));
    write(join(outFolder, content.language, 'random', 'index.html'), randomMessagePage(content, '../', `<a href="../">${languageName(content.language)}</a>`));
    for (const message of content.messages) {
      const otherLanguages = contents
        .filter((c) => c !== content && c.messages.some((m) => m.id === message.id))
        .map((c) => c.language);
      write(join(outFolder, content.language, message.slug, 'index.html'), messagePage(content, message, otherLanguages));
    }
  }
  const pages = contents.reduce((sum, c) => sum + c.messages.length, 0);
  console.log(`Wrote ${pages} message pages in ${contents.length} languages to ${outFolder}`);
}

buildSite(process.argv[2] ?? 'content', process.argv[3] ?? 'site');
