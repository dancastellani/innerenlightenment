// Checks every translation in content/ against the Portuguese original, content/pt.json,
// and prints a Markdown report listing every problem found.
// Usage: node scripts/check-translations.ts   (exits with 1 when any translation has a problem)

import { readdirSync, readFileSync } from 'node:fs';

type Message = { id: number; url: string; paragraphs: string[]; note: string | null; [field: string]: unknown };
export type Content = { language: string; messages: Message[] };

// Fields that are copied from the original as they are, never translated.
const KEPT_FIELDS = ['slug', 'url', 'book', 'chapter', 'spirit', 'medium', 'signature'];
// A text of at least this many words, nearly all of them also in the Portuguese text, was most likely left
// untranslated. Short sentences can read the same in both languages, such as "De salvador a desamparado…" in Spanish.
const UNTRANSLATED_MIN_WORDS = 5;
const UNTRANSLATED_SHARED_WORDS = 0.9;
// An epigraph this many times longer than the Portuguese one was most likely expanded into the full verse.
const EXPANDED_EPIGRAPH_RATIO = 1.5;

const words = (text: string) => text.toLowerCase().match(/\p{L}+/gu) ?? [];

// True when the text has enough words and nearly all of them are also in the original.
function isStillPortuguese(text: string, original: string): boolean {
  const textWords = words(text);
  const originalWords = new Set(words(original));
  const shared = textWords.filter((word) => originalWords.has(word)).length;
  return textWords.length >= UNTRANSLATED_MIN_WORDS && shared >= textWords.length * UNTRANSLATED_SHARED_WORDS;
}

export function checkTranslation(original: Content, translation: Content, lang: string): string[] {
  const findings: string[] = [];
  if (translation.language !== lang) findings.push(`language is "${translation.language}", expected "${lang}"`);

  const ids = translation.messages.map((m) => m.id);
  const originalIds = original.messages.map((m) => m.id);
  const sameOrder = originalIds.filter((id) => ids.includes(id));
  if (ids.join() !== sameOrder.join() && new Set(ids).size === ids.length) {
    findings.push('messages are not in the order of pt.json');
  }
  for (const o of original.messages) {
    if (!ids.includes(o.id)) findings.push(`[${o.id}](${o.url}) is missing`);
  }

  const seen = new Set<number>();
  for (const m of translation.messages) {
    const where = `[${m.id}](${m.url})`;
    const o = original.messages.find((o) => o.id === m.id);
    if (!o) {
      findings.push(`${where} is not in pt.json`);
      continue;
    }
    if (seen.has(m.id)) findings.push(`${where} appears more than once`);
    seen.add(m.id);

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
      if (isStillPortuguese(paragraph, o.paragraphs[i] ?? '')) {
        findings.push(`${where} paragraph ${i + 1} is still in Portuguese: "${paragraph}"`);
      }
    });
    if (m.note !== null && isStillPortuguese(m.note, o.note ?? '')) {
      findings.push(`${where} note is still in Portuguese: "${m.note}"`);
    }
    const epigraph = m.paragraphs[0] ?? '';
    const originalEpigraph = o.paragraphs[0] ?? '';
    if (originalEpigraph.startsWith('“') && epigraph.length > originalEpigraph.length * EXPANDED_EPIGRAPH_RATIO) {
      findings.push(`${where} epigraph is ${epigraph.length} characters, the original ${originalEpigraph.length}: "${epigraph}"`);
    }
  }
  return findings;
}

if (import.meta.main) {
  const original: Content = JSON.parse(readFileSync('content/pt.json', 'utf8'));
  let problems = 0;
  console.log('# Translation check\n');
  for (const file of readdirSync('content').filter((f) => f.endsWith('.json') && f !== 'pt.json')) {
    const lang = file.replace('.json', '');
    const translation: Content = JSON.parse(readFileSync(`content/${file}`, 'utf8'));
    const findings = checkTranslation(original, translation, lang);
    problems += findings.length;
    console.log(`## ${file}: ${findings.length} problems in ${translation.messages.length} messages\n`);
    for (const finding of findings) console.log(`- ${finding}`);
    if (findings.length > 0) console.log();
  }
  if (problems > 0) process.exit(1);
}
