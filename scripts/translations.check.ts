// Checks every message of every translation in content/ against the Portuguese original, as tests per message
// and language (one for the text and fields, one for the Bible references), grouped under the Portuguese message.
// A message that fails in en and es shows 2 failures in its group.
// Usage: node --test scripts/translations.check.ts   (./run.sh test also writes its report to test-reports/translations.xml)

import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBibleReferences, checkFile, checkLabels, checkMessage, missingLabels, readLanguage, translationsIn } from './check-translations.ts';

const original = readLanguage('content', 'pt').content;
const english = readLanguage('content', 'en').labels;
const translations = translationsIn('content').map((lang) => ({ lang, ...readLanguage('content', lang) }));

for (const o of original.messages) {
  describe(`${o.id} ${o.title}`, () => {
    for (const { lang, content } of translations) {
      const m = content.messages.find((m) => m.id === o.id);
      test(`${lang}: text and fields`, () => assert.deepEqual(m ? checkMessage(o, m) : ['is missing'], []));
      test(`${lang}: Bible references`, () => assert.deepEqual(m ? checkBibleReferences(o, m) : ['is missing'], []));
    }
  });
}

describe('translation files', () => {
  for (const { lang, content, labels } of translations) {
    test(lang, () => assert.deepEqual([...checkFile(original, content, lang), ...(lang === 'en' ? [] : checkLabels(english, labels))], []));
  }
});

// The enabled languages are the ones in content/languages.json. Portuguese is the source of the labels.
describe('enabled languages have every label of pt', () => {
  const enabled = Object.keys(JSON.parse(readFileSync('content/languages.json', 'utf8')));
  const portuguese = readLanguage('content', 'pt').labels;
  for (const lang of enabled) {
    test(lang, () => assert.deepEqual(missingLabels(portuguese, readLanguage('content', lang).labels), []));
  }
});
