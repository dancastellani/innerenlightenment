// Translates content/pt.json into another language with the Gemini API.
// Usage: GEMINI_API_KEY=... node scripts/translate.ts [lang]   (default: en, writes content/<lang>.json)
// Messages already in the output file are skipped, so an interrupted run can simply be started again.

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const MODEL = 'gemini-2.5-flash';
const BATCH_SIZE = 10;

type Message = { id: number; title: string; paragraphs: string[]; note: string | null; [field: string]: unknown };
type Content = { source: string; language: string; books: unknown[]; messages: Message[] };
type Translation = { id: number; title: string; paragraphs: string[]; note: string | null };

const lang = process.argv[2] ?? 'en';
const output = `content/${lang}.json`;
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('Set the GEMINI_API_KEY environment variable');

const source: Content = JSON.parse(await readFile('content/pt.json', 'utf8'));
const done: Message[] = existsSync(output) ? JSON.parse(await readFile(output, 'utf8')).messages : [];

async function translate(batch: Translation[]): Promise<Translation[]> {
  const prompt =
    `Translate these messages from Portuguese into the language with code "${lang}". ` +
    'They are Spiritist (Christian-based) spiritual texts; keep their tone, meaning and Bible references. ' +
    'Return the same JSON array with the same ids and the same number of paragraphs per message, ' +
    'translating only "title", "paragraphs" and "note" (leave null as null).\n\n' +
    JSON.stringify(batch);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key! },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (response.status === 429) {
    console.error('rate limited, waiting a minute');
    await new Promise((resolve) => setTimeout(resolve, 60_000));
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
console.error(`${done.length} already translated, ${todo.length} to go`);

for (let i = 0; i < todo.length; i += BATCH_SIZE) {
  const batch = todo.slice(i, i + BATCH_SIZE);
  const translations = await translate(batch.map(({ id, title, paragraphs, note }) => ({ id, title, paragraphs, note })));
  for (const original of batch) {
    const t = translations.find((t) => t.id === original.id);
    if (!t || t.paragraphs.length !== original.paragraphs.length) {
      console.error(`warning: skipping ${original.url}, translation missing or paragraph count differs`);
      continue;
    }
    done.push({ ...original, title: t.title, paragraphs: t.paragraphs, note: t.note });
  }
  await save();
  console.error(`${done.length}/${source.messages.length} translated`);
}
