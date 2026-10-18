// Checks every translation in content/ against the Portuguese original, content/pt/messages.json,
// and prints a Markdown report listing every problem found.
// Usage: node scripts/check-translations.ts   (exits with 1 when any translation has a problem)

import { existsSync, readdirSync, readFileSync } from 'node:fs';

type Message = { id: number; url: string; paragraphs: string[]; note: string | null; [field: string]: unknown };
type Book = { slug: string; name: string };
export type Labels = Record<string, string>;
export type Content = { language: string; books: Book[]; messages: Message[] };

// Fields that are copied from the original as they are, never translated.
const KEPT_FIELDS = ['slug', 'url', 'book', 'chapter', 'spirit', 'medium', 'signature'];
// A text of at least this many words, nearly all of them also in the Portuguese text, was most likely left
// untranslated. Short sentences can read the same in both languages, such as "De salvador a desamparado…" in Spanish.
const UNTRANSLATED_MIN_WORDS = 5;
const UNTRANSLATED_SHARED_WORDS = 0.9;
// An epigraph this many times longer than the Portuguese one was most likely expanded into the full verse.
const EXPANDED_EPIGRAPH_RATIO = 1.5;

const words = (text: string) => text.toLowerCase().match(/\p{L}+/gu) ?? [];

// Bible references are the parts in brackets with a number, such as "(II Timóteo, 2.7)" or "(2 Timothy 2:7)".
const references = (text: string) => text.match(/\([^()]*\d[^()]*\)/g) ?? [];

// The numbers of a text's Bible references, such as "2 2 7" for "(II Timóteo, 2.7)". Book names are translated and
// verses are written "2.7" or "2:7", so only the numbers are compared, with I, II and III read as 1, 2 and 3.
function referenceNumbers(text: string): string {
  const romanToNumber: Record<string, string> = { I: '1', II: '2', III: '3' };
  return references(text)
    .map((reference) => reference.replace(/\b(I|II|III)\b/g, (roman) => romanToNumber[roman]).match(/\d+/g)?.join(' '))
    .join(' | ');
}

// True when the text has enough words and nearly all of them are also in the original.
function isUntranslated(text: string, original: string): boolean {
  const textWords = words(text);
  const originalWords = new Set(words(original));
  const shared = textWords.filter((word) => originalWords.has(word)).length;
  return textWords.length >= UNTRANSLATED_MIN_WORDS && shared >= textWords.length * UNTRANSLATED_SHARED_WORDS;
}

// The problems of the whole file: its language, the order of its messages, and messages that are unknown or repeated.
export function checkFile(original: Content, translation: Content, lang: string): string[] {
  const findings: string[] = [];
  if (translation.language !== lang) findings.push(`language is "${translation.language}", expected "${lang}"`);

  for (const o of original.books) {
    const book = translation.books.find((b) => b.slug === o.slug);
    if (!book) findings.push(`book "${o.slug}" is missing`);
    else if (book.name === o.name) findings.push(`book name "${book.name}" is still in Portuguese`);
  }
  for (const book of translation.books) {
    if (!original.books.some((o) => o.slug === book.slug)) findings.push(`book "${book.slug}" is not in pt.json`);
  }

  const ids = translation.messages.map((m) => m.id);
  const originalIds = original.messages.map((m) => m.id);
  const sameOrder = originalIds.filter((id) => ids.includes(id));
  if (ids.join() !== sameOrder.join() && new Set(ids).size === ids.length) {
    findings.push('messages are not in the order of pt.json');
  }

  const seen = new Set<number>();
  for (const m of translation.messages) {
    const where = `[${m.id}](${m.url})`;
    if (!originalIds.includes(m.id)) findings.push(`${where} is not in pt.json`);
    else if (seen.has(m.id)) findings.push(`${where} appears more than once`);
    seen.add(m.id);
  }
  return findings;
}

// The Bible references of one translated message must have the numbers of the original, in every paragraph.
export function checkBibleReferences(o: Message, m: Message): string[] {
  const findings: string[] = [];
  m.paragraphs.forEach((paragraph, i) => {
    const original = o.paragraphs[i] ?? '';
    if (referenceNumbers(paragraph) !== referenceNumbers(original)) {
      const from = references(original).join(' ') || 'none';
      const to = references(paragraph).join(' ') || 'none';
      findings.push(`[${m.id}](${m.url}) paragraph ${i + 1} Bible reference changed from ${from} to ${to}`);
    }
  });
  return findings;
}

// The other problems of one translated message, compared with its original.
export function checkMessage(o: Message, m: Message): string[] {
  const findings: string[] = [];
  const where = `[${m.id}](${m.url})`;
  if (Object.keys(m).join() !== Object.keys(o).join()) {
    findings.push(`${where} has the fields ${Object.keys(m).join(', ')}, expected ${Object.keys(o).join(', ')}`);
  }
  for (const field of KEPT_FIELDS) {
    if (m[field] !== o[field]) findings.push(`${where} ${field} changed from "${o[field]}" to "${m[field]}"`);
  }
  if (m.paragraphs.length !== o.paragraphs.length) {
    findings.push(`${where} has ${m.paragraphs.length} paragraphs, expected ${o.paragraphs.length}`);
  }
  if ((m.note === null) !== (o.note === null)) {
    findings.push(`${where} ${o.note === null ? 'has a note the original does not have' : 'lost its note'}`);
  }
  m.paragraphs.forEach((paragraph, i) => {
    const original = o.paragraphs[i] ?? '';
    if (isUntranslated(paragraph, original)) {
      findings.push(`${where} paragraph ${i + 1} is still in Portuguese: "${paragraph}"`);
    }
  });
  if (m.note !== null && isUntranslated(m.note, o.note ?? '')) {
    findings.push(`${where} note is still in Portuguese: "${m.note}"`);
  }
  const epigraph = m.paragraphs[0] ?? '';
  const originalEpigraph = o.paragraphs[0] ?? '';
  if (originalEpigraph.startsWith('“') && epigraph.length > originalEpigraph.length * EXPANDED_EPIGRAPH_RATIO) {
    findings.push(`${where} epigraph is ${epigraph.length} characters, the original ${originalEpigraph.length}: "${epigraph}"`);
  }
  return findings;
}

// The labels (app and website text) of a translation against the English ones: the same keys, none empty or
// left in English. The Portuguese labels are written by hand and are not checked.
export function checkLabels(english: Labels, labels: Labels): string[] {
  const findings: string[] = [];
  for (const [name, text] of Object.entries(english)) {
    if (!labels[name]?.trim()) findings.push(`label "${name}" is missing`);
    else if (isUntranslated(labels[name], text)) findings.push(`label "${name}" is still in English: "${labels[name]}"`);
  }
  for (const name of Object.keys(labels)) {
    if (!(name in english)) findings.push(`label "${name}" is not in en.json`);
  }
  return findings;
}

export function checkTranslation(original: Content, translation: Content, lang: string): string[] {
  const findings = checkFile(original, translation, lang);
  for (const o of original.messages) {
    const m = translation.messages.find((m) => m.id === o.id);
    findings.push(...(m ? [...checkMessage(o, m), ...checkBibleReferences(o, m)] : [`[${o.id}](${o.url}) is missing`]));
  }
  return findings;
}

// A language folder: its messages.json and its labels.json (missing when the language has no labels yet).
export function readLanguage(folder: string, lang: string): { content: Content; labels: Labels } {
  const labelsFile = `${folder}/${lang}/labels.json`;
  return {
    content: JSON.parse(readFileSync(`${folder}/${lang}/messages.json`, 'utf8')),
    labels: existsSync(labelsFile) ? JSON.parse(readFileSync(labelsFile, 'utf8')) : {},
  };
}

// The translations in the folder, that is every language but Portuguese, the original.
export function translationsIn(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name !== 'pt').map((entry) => entry.name);
}

// Checks every translation in the folder and returns the findings of each language.
export function checkContentFolder(folder: string): Record<string, { messages: number; findings: string[] }> {
  const original = readLanguage(folder, 'pt').content;
  const english = readLanguage(folder, 'en').labels;
  const results: Record<string, { messages: number; findings: string[] }> = {};
  for (const lang of translationsIn(folder)) {
    const { content, labels } = readLanguage(folder, lang);
    const findings = checkTranslation(original, content, lang);
    if (lang !== 'en') findings.push(...checkLabels(english, labels));
    results[lang] = { messages: content.messages.length, findings };
  }
  return results;
}

if (import.meta.main) {
  let problems = 0;
  console.log('# Translation check\n');
  for (const [lang, { messages, findings }] of Object.entries(checkContentFolder('content'))) {
    problems += findings.length;
    console.log(`## ${lang}: ${findings.length} problems in ${messages} messages\n`);
    for (const finding of findings) console.log(`- ${finding}`);
    if (findings.length > 0) console.log();
  }
  if (problems > 0) process.exit(1);
}
