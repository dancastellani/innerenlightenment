// Checks every message of every translation in content/ against the Portuguese original, as one test per message
// and language, grouped under the Portuguese message. A message that fails in en and es shows 2 failures in its group.
// Usage: node --test scripts/translations.check.ts   (./run.sh test also writes its report to test-reports/translations.xml)

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { checkFile, checkMessage, type Content } from './check-translations.ts';

const original: Content = JSON.parse(readFileSync('content/pt.json', 'utf8'));
const translations = readdirSync('content')
  .filter((file) => file.endsWith('.json') && file !== 'pt.json')
  .map((file) => ({ lang: file.replace('.json', ''), content: JSON.parse(readFileSync(`content/${file}`, 'utf8')) as Content }));

for (const o of original.messages) {
  describe(`${o.id} ${o.title}`, () => {
    for (const { lang, content } of translations) {
      test(lang, () => {
        const m = content.messages.find((m) => m.id === o.id);
        assert.deepEqual(m ? checkMessage(o, m) : ['is missing'], []);
      });
    }
  });
}

describe('translation files', () => {
  for (const { lang, content } of translations) {
    test(lang, () => assert.deepEqual(checkFile(original, content, lang), []));
  }
});
