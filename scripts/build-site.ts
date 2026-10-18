// Builds the static website from content/<lang>/messages.json and labels.json: one page per message at <lang>/<slug>/
// (the link the app shares), a list of messages per language, and <lang>/random/, which opens
// a random message. The home page opens a random English message.
//
// The look lives in website/: HTML templates in website/templates/, the stylesheet, and
// content/languages.json with each language's name (a new language needs an entry there). The other text of
// the pages, such as "Another message" and the disclaimer, is the language's labels.json.
//
// Usage: node scripts/build-site.ts [content folder] [output folder]

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Message } from './parse-message.ts';
import { originalLink, withOriginal } from '../mobile/language.ts';
import { showWindows1252 } from '../mobile/text.ts';

type Content = { language: string; books: { slug: string; name: string }[]; labels: Labels; messages: Message[] };
// One disclaimer per message page: `disclaimer` (the source, no liability), followed on translated messages
// by `translationDisclaimer` (made by AI), which every language but Portuguese (the original) has.
// `original` is the button that shows the Portuguese original (UC-18), and in Portuguese the mark that it is the original.
type Labels = {
  title: string;
  credit: string;
  index: string;
  menu: string;
  anotherMessage: string;
  readOriginal: string;
  original: string;
  studyGroups: string;
  studyGroupsIntro: string;
  disclaimer: string;
  translationDisclaimer?: string;
};
type Names = Record<string, { name: string }>;
// UC-19: Spiritist organizations with study meetings, the same list the app shows.
type StudyGroup = { name: string; url: string };

const WEBSITE_FOLDER = join(import.meta.dirname, '..', 'website');

// Also shows Windows-1252 codes as their characters (bugs #67, #71), since every text goes through here.
function escapeHtml(text: string): string {
  return showWindows1252(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
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
  names: Names;
  studyGroups: StudyGroup[];

  constructor(contents: Content[], names: Names, studyGroups: StudyGroup[]) {
    for (const content of contents) {
      if (!names[content.language]) throw new Error(`Add "${content.language}" to content/languages.json`);
    }
    this.contents = contents;
    this.names = names;
    this.studyGroups = studyGroups;
  }

  build(outFolder: string) {
    rmSync(outFolder, { recursive: true, force: true });
    mkdirSync(outFolder, { recursive: true });
    copyFileSync(join(WEBSITE_FOLDER, 'style.css'), join(outFolder, 'style.css'));
    copyFileSync(join(WEBSITE_FOLDER, 'favicon.svg'), join(outFolder, 'favicon.svg'));
    write(join(outFolder, 'index.html'), this.homePage());
    for (const content of this.contents) {
      const folder = join(outFolder, content.language);
      write(join(folder, 'index.html'), this.languagePage(content));
      write(join(folder, 'random', 'index.html'), this.randomPage(content));
      write(join(folder, 'study-groups', 'index.html'), this.studyGroupsPage(content));
      for (const message of content.messages) {
        write(join(folder, message.slug, 'index.html'), this.messagePage(content, message));
      }
    }
  }

  // Opens a random English message (or of the first language when there is no English).
  homePage(): string {
    const content = this.contents.find((c) => c.language === 'en') ?? this.contents[0];
    const languages = this.contents
      .map((c) => `<li><a href="${c.language}/">${this.names[c.language].name}</a></li>`)
      .join('\n');
    const fallback = this.render('home', { title: content.labels.title, languages, credit: this.credit(content) });
    return this.page(content.language, content.labels.title, '', this.randomScript(content, `${content.language}/`, fallback));
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
    const name = this.names[content.language].name;
    const body = this.render('language', { title: content.labels.title, languageName: name, bookLinks, books: books.join('\n') });
    return this.page(content.language, name, '../', body);
  }

  // The "Another message" link: opens a random message of the same language.
  randomPage(content: Content): string {
    const fallback = `<a href="../">${this.names[content.language].name}</a>`;
    return this.page(content.language, content.labels.title, '../', this.randomScript(content, '../', fallback));
  }

  // UC-19: links to Spiritist organizations that hold study meetings.
  studyGroupsPage(content: Content): string {
    const labels = content.labels;
    const groups = this.studyGroups.map((g) => `<li><a href="${g.url}">${escapeHtml(g.name)}</a></li>`).join('\n');
    const body = this.render('study-groups', {
      index: labels.index,
      studyGroups: labels.studyGroups,
      studyGroupsIntro: labels.studyGroupsIntro,
      groups,
    });
    return this.page(content.language, labels.studyGroups, '../../', body);
  }

  messagePage(content: Content, message: Message): string {
    const labels = content.labels;
    const book = content.books.find((b) => b.slug === message.book);
    const meta = [book?.name, message.chapter].filter((text) => text).map((text) => escapeHtml(text!)).join(' · ');
    const otherLanguages = this.contents
      .filter((c) => c !== content && c.messages.some((m) => m.id === message.id))
      .map((c) => `<a href="../../${c.language}/${message.slug}/">${this.names[c.language].name}</a>`)
      .join('');
    const original = this.original(content, message);
    const body = this.render('message', {
      anotherMessage: labels.anotherMessage,
      index: labels.index,
      menu: labels.menu,
      languageName: this.names[content.language].name,
      otherLanguages,
      meta,
      title: escapeHtml(message.title),
      originalTitle: original.originalTitle,
      paragraphs: original.paragraphs,
      signature: signature(message),
      note: message.note ? `<p class="note">${escapeHtml(message.note)}</p>` : '',
      url: escapeHtml(originalLink(message.url, content.language)),
      readOriginal: labels.readOriginal,
      studyGroups: labels.studyGroups,
      credit: this.credit(content),
      disclaimer: `<p class="disclaimer">${[labels.disclaimer, labels.translationDisclaimer].filter((text) => text).join(' ')}</p>`,
    });
    return this.page(content.language, message.title, '../../', body, original);
  }

  // UC-18: on a translation, an "Original" switch that shows the Portuguese text after each paragraph;
  // it works without JavaScript (a checkbox, see style.css). The Portuguese page is marked as the original.
  // The switch sits in the page's top bar, so `checkbox` and `label` go to the layout, apart from the text.
  original(content: Content, message: Message): { checkbox: string; label: string; originalTitle: string; paragraphs: string } {
    const label = content.labels.original;
    const original = this.contents.find((c) => c.language === 'pt')?.messages.find((m) => m.id === message.id);
    if (content.language === 'pt' || !original) {
      return {
        checkbox: '',
        label: content.language === 'pt' ? `<span class="original-mark">${label}</span>` : '',
        originalTitle: '',
        paragraphs: message.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n'),
      };
    }
    return {
      checkbox: '<input type="checkbox" id="show-original" class="show-original">',
      label: `<label for="show-original">${label}</label>`,
      originalTitle: `<p class="original" lang="pt">${escapeHtml(original.title)}</p>`,
      paragraphs: withOriginal(message.paragraphs, original.paragraphs)
        .map((p) => (p.isOriginal ? `<p class="original" lang="pt">${escapeHtml(p.text)}</p>` : `<p>${escapeHtml(p.text)}</p>`))
        .join('\n'),
    };
  }

  // The credit to fonteviva.org, with its address as a link.
  credit(content: Content): string {
    const link = '<a href="https://fonteviva.org/">fonteviva.org</a>';
    return this.render('credit', { credit: escapeHtml(content.labels.credit).replace('fonteviva.org', link) });
  }

  // `root` is the path from the page to the site's root folder, for the stylesheet.
  page(language: string, title: string, root: string, body: string, original = { checkbox: '', label: '' }): string {
    const values = { language, title: escapeHtml(title), root, body: body.trimEnd() };
    return this.render('layout', { ...values, originalCheckbox: original.checkbox, originalLabel: original.label });
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

// Each language is a folder with its messages.json and its labels.json.
function readContents(folder: string): Content[] {
  const languages = readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (languages.length === 0) throw new Error(`No content files (<lang>/messages.json) in ${folder}`);
  return languages.map((language) => {
    const content = JSON.parse(readFileSync(join(folder, language, 'messages.json'), 'utf8'));
    const labelsFile = join(folder, language, 'labels.json');
    if (!existsSync(labelsFile)) throw new Error(`${language} has no labels.json`);
    content.labels = JSON.parse(readFileSync(labelsFile, 'utf8'));
    return content;
  });
}

function write(file: string, html: string) {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, html);
}

const [contentFolder = 'content', outFolder = 'site'] = process.argv.slice(2);
const contents = readContents(contentFolder);
const names = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'content', 'languages.json'), 'utf8'));
const studyGroups = JSON.parse(readFileSync(join(WEBSITE_FOLDER, 'study-groups.json'), 'utf8'));
new Website(contents, names, studyGroups).build(outFolder);
const pages = contents.reduce((sum, c) => sum + c.messages.length, 0);
console.log(`Wrote ${pages} message pages in ${contents.length} languages to ${outFolder}`);
