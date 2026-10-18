// Translates content/pt.json into another language with the Gemini API.
// Usage: GEMINI_API_KEY=... node scripts/translate.ts [lang]   (default: en, writes content/<lang>.json)
// Also translates the app and website text (the "labels" of content/en.json, such as "Settings" and the disclaimer).
// Messages and labels already in the output file are skipped, so an interrupted run can simply be started again.

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const MODEL = 'gemini-3.5-flash-lite';
const BATCH_SIZE = 10;
// The free tier allows 10 requests per minute, so start at most one request every 6.5 seconds.
const SECONDS_BETWEEN_REQUESTS = 6.5;

type Message = { id: number; title: string; paragraphs: string[]; note: string | null; [field: string]: unknown };
type Book = { slug: string; name: string; [field: string]: unknown };
type Labels = Record<string, string>;
type Content = { source: string; language: string; books: Book[]; labels?: Labels; messages: Message[] };
type Translation = { id: number; title: string; paragraphs: string[]; note: string | null };

const lang = process.argv[2] ?? 'en';
const output = `content/${lang}.json`;
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('Set the GEMINI_API_KEY environment variable');

const source: Content = JSON.parse(await readFile('content/pt.json', 'utf8'));
const existing: Content | undefined = existsSync(output) ? JSON.parse(await readFile(output, 'utf8')) : undefined;
const done: Message[] = existing?.messages ?? [];
const labels: Labels = existing?.labels ?? {};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
let lastRequest = 0;

// Sends the prompt to Gemini and returns its JSON answer, or undefined when the answer is not valid JSON.
async function ask<T>(prompt: string): Promise<T | undefined> {
  await sleep(Math.max(0, SECONDS_BETWEEN_REQUESTS - (Date.now() - lastRequest) / 1000));
  lastRequest = Date.now();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key! },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (response.status === 429) {
    console.error(`rate limited, waiting a minute: ${await response.text()}`);
    await sleep(60);
    return ask(prompt);
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  const result = await response.json();
  const text = result.candidates[0].content.parts[0].text;
  try {
    return JSON.parse(text);
  } catch (error) {
    // Gemini sometimes returns broken JSON, for example with unescaped quotes. Count it as failed
    // and go on; the next run translates it again.
    console.error(`warning: the answer is not valid JSON: ${error}`);
    return undefined;
  }
}

async function translate(batch: Translation[]): Promise<Translation[]> {
  const prompt =
    `Translate these messages from Portuguese into the language with code "${lang}". ` +
    'They are Spiritist (Christian-based) spiritual texts; keep their tone, meaning and Bible references. ' +
    'Return the same JSON array with the same ids and the same number of paragraphs per message, ' +
    'translating only "title", "paragraphs" and "note" (leave null as null).\n\n' +
    JSON.stringify(batch);
  return (await ask<Translation[]>(prompt)) ?? [];
}

// The English labels not yet translated. Portuguese has its own labels in content/pt.labels.json.
async function translateLabels() {
  const english: Content = JSON.parse(await readFile('content/en.json', 'utf8'));
  const todo = Object.fromEntries(Object.entries(english.labels ?? {}).filter(([name]) => !labels[name]));
  if (lang === 'en' || Object.keys(todo).length === 0) return;
  const prompt =
    `Translate the values of this JSON object from English into the language with code "${lang}". ` +
    'They are button names, menu items and short notices of an app with Spiritist (Christian-based) spiritual messages. ' +
    'Return the same JSON object with the same keys; keep "fonteviva.org" as it is.\n\n' +
    JSON.stringify(todo);
  const translated = await ask<Labels>(prompt);
  if (!translated) return;
  for (const name of Object.keys(todo)) {
    if (translated[name]) labels[name] = translated[name];
    else console.error(`warning: failed label "${name}", translation missing`);
  }
  console.error(`labels: ${Object.keys(todo).length} translated`);
}

// The books in the order of pt.json, keeping the names already translated in the output file
// and translating the names of new books.
async function translateBooks(): Promise<Book[]> {
  const translatedName = (book: Book) => existing?.books.find((b) => b.slug === book.slug && b.name !== book.name)?.name;
  const todo = source.books.filter((book) => !translatedName(book)).map(({ slug, name }) => ({ slug, name }));
  let names: { slug: string; name: string }[] = [];
  if (todo.length > 0) {
    const prompt =
      `Translate these Spiritist book titles from Portuguese into the language with code "${lang}", ` +
      'using the published title when the book has one. Return the same JSON array with the same slugs, ' +
      'translating only "name".\n\n' +
      JSON.stringify(todo);
    names = (await ask<{ slug: string; name: string }[]>(prompt)) ?? [];
  }
  return source.books.map((book) => {
    const name = translatedName(book) ?? names.find((n) => n.slug === book.slug)?.name;
    if (!name) console.error(`warning: failed to translate the book name "${book.name}"`);
    else console.info(`book: ${book.name} -> ${name}`);
    return { ...book, name: name ?? book.name };
  });
}

const books = await translateBooks();

async function save() {
  // Keep the order of pt.json, whatever order the translations arrived in.
  const messages = source.messages.flatMap((m) => done.filter((d) => d.id === m.id));
  const json = JSON.stringify({ ...source, language: lang, books, labels, messages }, null, 1);
  await writeFile(output, json + '\n');
}

await translateLabels();
await save();

const todo = source.messages.filter((m) => !done.some((d) => d.id === m.id));
const skipped = done.length;
let translated = 0;
let failed = 0;
console.error(`${skipped} skipped (already translated), ${todo.length} to translate`);

for (let i = 0; i < todo.length; i += BATCH_SIZE) {
  const batch = todo.slice(i, i + BATCH_SIZE);
  const translations = await translate(batch.map(({ id, title, paragraphs, note }) => ({ id, title, paragraphs, note })));
  for (const original of batch) {
    const t = translations.find((t) => t.id === original.id);
    if (!t || t.paragraphs.length !== original.paragraphs.length) {
      console.error(`warning: failed ${original.url}, translation missing or paragraph count differs`);
      failed++;
      continue;
    }
    console.info(`translated: ${original.title} -> ${t.title}`);
    done.push({ ...original, title: t.title, paragraphs: t.paragraphs, note: t.note });
    translated++;
  }
  await save();
  console.error(`batch ${i / BATCH_SIZE + 1}/${Math.ceil(todo.length / BATCH_SIZE)}: ${translated} translated, ${failed} failed`);
}

// Saves the book names also when no message was left to translate.
await save();
console.error(`done: ${translated} translated, ${skipped} skipped, ${failed} failed; ${done.length}/${source.messages.length} in ${output}`);
