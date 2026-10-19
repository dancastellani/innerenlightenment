import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkContentFolder } from './check-translations.ts';
import { enableLanguage } from './enable-language.ts';

function message(paragraphs: string[]) {
  return { id: 1, slug: '1', url: 'https://fonteviva.org/livro/1/', book: 'Livro', title: 'Título', chapter: '1', spirit: 'Emmanuel', medium: 'Chico', paragraphs, signature: 'Emmanuel', note: null };
}

function writeLanguage(folder: string, lang: string, paragraph: string, labels: object = { settings: 'Settings' }, book = 'Livro') {
  mkdirSync(join(folder, lang), { recursive: true });
  const content = { language: lang, books: [{ slug: 'livro', name: book }], messages: [message([paragraph])] };
  writeFileSync(join(folder, lang, 'messages.json'), JSON.stringify(content));
  writeFileSync(join(folder, lang, 'labels.json'), JSON.stringify(labels));
}

// A content folder with Portuguese and English enabled, and the folder of a language still being prepared.
function contentFolder(): string {
  const folder = mkdtempSync(join(tmpdir(), 'content-'));
  writeLanguage(folder, 'pt', 'Primeiro.', { settings: 'Ajustes' });
  writeLanguage(folder, 'en', 'First.', undefined, 'Book');
  writeFileSync(join(folder, 'languages.json'), '{\n  "en": { "name": "English" },\n  "pt": { "name": "Português" }\n}\n');
  return folder;
}

test('a language folder that is not in languages.json is not checked', () => {
  const folder = contentFolder();
  writeLanguage(folder, 'eo', 'Primeiro.');
  assert.deepEqual(Object.keys(checkContentFolder(folder)), ['en']);
});

test('a language without problems is added to languages.json with its name', () => {
  const folder = contentFolder();
  writeLanguage(folder, 'eo', 'Unua.', undefined, 'Libro');
  assert.deepEqual(enableLanguage(folder, 'eo', 'Esperanto'), []);
  assert.equal(
    readFileSync(join(folder, 'languages.json'), 'utf8'),
    '{\n  "en": { "name": "English" },\n  "pt": { "name": "Português" },\n  "eo": { "name": "Esperanto" }\n}\n',
  );
});

test('a language with problems is not added', () => {
  const folder = contentFolder();
  const before = readFileSync(join(folder, 'languages.json'), 'utf8');
  writeLanguage(folder, 'eo', 'Primeiro.');
  assert.notDeepEqual(enableLanguage(folder, 'eo', 'Esperanto'), []);
  assert.equal(readFileSync(join(folder, 'languages.json'), 'utf8'), before);
});

test('a language without a folder, or already enabled, is refused', () => {
  const folder = contentFolder();
  assert.deepEqual(enableLanguage(folder, 'it', 'Italiano'), [`${folder}/it/messages.json does not exist`]);
  assert.deepEqual(enableLanguage(folder, 'en', 'English'), ['en is already enabled']);
});
