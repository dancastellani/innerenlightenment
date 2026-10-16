// Translates content/pt.json into another language with the Gemini API.
// Usage: GEMINI_API_KEY=... node scripts/translate.ts [lang]   (default: en, writes content/<lang>.json)
// Messages already in the output file are skipped, so an interrupted run can simply be started again.

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const MODEL = 'gemini-3.5-flash-lite';
const BATCH_SIZE = 10;
// The free tier allows 10 requests per minute, so start at most one request every 6.5 seconds.
const SECONDS_BETWEEN_REQUESTS = 6.5;

type Message = { id: number; title: string; paragraphs: string[]; note: string | null; [field: string]: unknown };
type Content = { source: string; language: string; books: unknown[]; messages: Message[] };
type Translation = { id: number; title: string; paragraphs: string[]; note: string | null };

const lang = process.argv[2] ?? 'en';
const output = `content/${lang}.json`;
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('Set the GEMINI_API_KEY environment variable');

const source: Content = JSON.parse(await readFile('content/pt.json', 'utf8'));
const done: Message[] = existsSync(output) ? JSON.parse(await readFile(output, 'utf8')).messages : [];

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
let lastRequest = 0;

async function translate(batch: Translation[]): Promise<Translation[]> {
  const prompt =
    `Translate these messages from Portuguese into the language with code "${lang}". ` +
    'They are Spiritist (Christian-based) spiritual texts; keep their tone, meaning and Bible references. ' +
    'Return the same JSON array with the same ids and the same number of paragraphs per message, ' +
    'translating only "title", "paragraphs" and "note" (leave null as null).\n\n' +
    JSON.stringify(batch);
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
    return translate(batch);
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}

async function save() {
  // Keep the order of pt.json, whatever order the translations arrived in.
  const messages = source.messages.flatMap((m) => done.filter((d) => d.id === m.id));
  const json = JSON.stringify({ ...source, language: lang, messages }, null, 1);
  await writeFile(output, json + '\n');
}

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
    console.info(`translating: ${t.title}...`);
    if (!t || t.paragraphs.length !== original.paragraphs.length) {
      console.error(`warning: failed ${original.url}, translation missing or paragraph count differs`);
      failed++;
      continue;
    }
    console.info(`translated: ${t.title}`);
    done.push({ ...original, title: t.title, paragraphs: t.paragraphs, note: t.note });
    translated++;
  }
  await save();
  console.error(`batch ${i / BATCH_SIZE + 1}/${Math.ceil(todo.length / BATCH_SIZE)}: ${translated} translated, ${failed} failed`);
}

console.error(`done: ${translated} translated, ${skipped} skipped, ${failed} failed; ${done.length}/${source.messages.length} in ${output}`);
