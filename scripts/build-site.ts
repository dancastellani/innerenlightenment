// Builds the static website from content/<lang>.json: one page per message at <lang>/<slug>/
// (the link the app shares), a list of messages per language, and <lang>/random/, which opens
// a random message. The home page opens a random English message.
//
// The look lives in website/: HTML templates in website/templates/, the stylesheet, and
// website/languages.json with each language's name and labels (a new language needs an entry there).
//
// Usage: node scripts/build-site.ts [content folder] [output folder]

import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Message } from './parse-message.ts';
import { originalLink } from '../mobile/language.ts';

type Content = { language: string; books: { slug: string; name: string }[]; messages: Message[] };
// translationDisclaimer is shown on translated messages, so every language but Portuguese (the original) has one.
type Labels = { name: string; index: string; anotherMessage: string; readOriginal: string; translationDisclaimer?: string };

const WEBSITE_FOLDER = join(import.meta.dirname, '..', 'website');

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// Replaces each {{name}} in the template with values[name]. Values are HTML, already escaped.
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (_, name: string) => {
    if (!(name in values)) throw new Error(`No value for {{${name}}} in a website template`);
    return values[name];
  });
}

class Website {
  contents: Content[];
  labels: Record<string, Labels>;

  constructor(contents: Content[], labels: Record<string, Labels>) {
    for (const content of contents) {
      if (!labels[content.language]) throw new Error(`Add "${content.language}" to website/languages.json`);
    }
    this.contents = contents;
    this.labels = labels;
  }

  build(outFolder: string) {
    rmSync(outFolder, { recursive: true, force: true });
    mkdirSync(outFolder, { recursive: true });
    copyFileSync(join(WEBSITE_FOLDER, 'style.css'), join(outFolder, 'style.css'));
    write(join(outFolder, 'index.html'), this.homePage());
    for (const content of this.contents) {
      const folder = join(outFolder, content.language);
      write(join(folder, 'index.html'), this.languagePage(content));
      write(join(folder, 'random', 'index.html'), this.randomPage(content));
      for (const message of content.messages) {
        write(join(folder, message.slug, 'index.html'), this.messagePage(content, message));
      }
    }
  }

  // Opens a random English message (or of the first language when there is no English).
  homePage(): string {
    const content = this.contents.find((c) => c.language === 'en') ?? this.contents[0];
    const languages = this.contents
      .map((c) => `<li><a href="${c.language}/">${this.labels[c.language].name}</a></li>`)
      .join('\n');
    const fallback = this.render('home', { languages, credit: this.render('credit', {}) });
    return this.page(content.language, 'Fonte Viva messages', '', this.randomScript(content, `${content.language}/`, fallback));
  }

  // The books first, as links to their part of the page, then each book's messages.
  languagePage(content: Content): string {
    const bookLinks = content.books
      .map((book) => `<li><a href="#${book.slug}">${escapeHtml(book.name)}</a></li>`)
      .join('\n');
    const books = content.books.map((book) => {
      const links = content.messages
        .filter((m) => m.book === book.slug)
        .map((m) => `<li><a href="${m.slug}/">${escapeHtml(m.title)}</a></li>`)
        .join('\n');
      return `<h2 id="${book.slug}">${escapeHtml(book.name)}</h2>\n<ul>\n${links}\n</ul>`;
    });
    const name = this.labels[content.language].name;
    const body = this.render('language', { languageName: name, bookLinks, books: books.join('\n') });
    return this.page(content.language, name, '../', body);
  }

  // The "Another message" link: opens a random message of the same language.
  randomPage(content: Content): string {
    const fallback = `<a href="../">${this.labels[content.language].name}</a>`;
    return this.page(content.language, 'Fonte Viva messages', '../', this.randomScript(content, '../', fallback));
  }

  messagePage(content: Content, message: Message): string {
    const labels = this.labels[content.language];
    const book = content.books.find((b) => b.slug === message.book);
    const meta = [book?.name, message.chapter].filter((text) => text).map((text) => escapeHtml(text!)).join(' · ');
    const otherLanguages = this.contents
      .filter((c) => c !== content && c.messages.some((m) => m.id === message.id))
      .map((c) => ` · <a href="../../${c.language}/${message.slug}/">${this.labels[c.language].name}</a>`)
      .join('');
    const body = this.render('message', {
      anotherMessage: labels.anotherMessage,
      index: labels.index,
      languageName: labels.name,
      otherLanguages,
      meta,
      title: escapeHtml(message.title),
      paragraphs: message.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n'),
      signature: signature(message),
      note: message.note ? `<p class="note">${escapeHtml(message.note)}</p>` : '',
      translationDisclaimer: labels.translationDisclaimer ? `<p class="translation">${labels.translationDisclaimer}</p>` : '',
      url: escapeHtml(originalLink(message.url, content.language)),
      readOriginal: labels.readOriginal,
      credit: this.render('credit', {}),
    });
    return this.page(content.language, message.title, '../../', body);
  }

  // `root` is the path from the page to the site's root folder, for the stylesheet.
  page(language: string, title: string, root: string, body: string): string {
    return this.render('layout', { language, title: escapeHtml(title), root, body: body.trimEnd() });
  }

  // `prefix` is the path from the page to the language folder. Without JavaScript it shows `fallback`.
  randomScript(content: Content, prefix: string, fallback: string): string {
    const slugs = JSON.stringify(content.messages.map((m) => m.slug));
    return this.render('random', { slugs, prefix, fallback: fallback.trimEnd() });
  }

  render(template: string, values: Record<string, string>): string {
    return fill(readFileSync(join(WEBSITE_FOLDER, 'templates', `${template}.html`), 'utf8'), values);
  }
}

// The spirit's signature with the medium under it, e.g. "Emmanuel" and "via Francisco Candido Xavier".
function signature(message: Message): string {
  const lines = [];
  if (message.signature) lines.push(escapeHtml(message.signature));
  if (message.medium) lines.push(`<span class="medium">${escapeHtml(message.medium.replace(/^via:\s*/, 'via '))}</span>`);
  return lines.length ? `<p class="signature">${lines.join('<br>\n')}</p>` : '';
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

const [contentFolder = 'content', outFolder = 'site'] = process.argv.slice(2);
const contents = readContents(contentFolder);
const labels = JSON.parse(readFileSync(join(WEBSITE_FOLDER, 'languages.json'), 'utf8'));
new Website(contents, labels).build(outFolder);
const pages = contents.reduce((sum, c) => sum + c.messages.length, 0);
console.log(`Wrote ${pages} message pages in ${contents.length} languages to ${outFolder}`);
