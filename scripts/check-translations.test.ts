import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { checkTranslation, type Content } from './check-translations.ts';

function message(id: number, paragraphs: string[], note: string | null = null) {
  const url = `https://fonteviva.org/livro/${id}/`;
  return { id, slug: `${id}`, url, book: 'Livro', title: 'Título', chapter: '1', spirit: 'Emmanuel', medium: 'Chico', paragraphs, signature: 'Emmanuel', note };
}

const original: Content = {
  language: 'pt',
  books: [{ slug: 'livro', name: 'Livro' }, { slug: 'luz', name: 'Luz' }],
  messages: [message(1, ['“Curto.” (João, 1.1)', 'Primeiro.']), message(2, ['Um.', 'Dois.'], 'Nota.'), message(3, ['Só.'])],
};

function translated(): Content {
  return {
    language: 'en',
    books: [{ slug: 'livro', name: 'Book' }, { slug: 'luz', name: 'Light' }],
    messages: [message(1, ['“Short.” (John, 1:1)', 'First.']), message(2, ['One.', 'Two.'], 'Note.'), message(3, ['Only.'])],
  };
}

test('a complete translation has no findings', () => {
  assert.deepEqual(checkTranslation(original, translated(), 'en'), []);
});

test('the language must match the file name', () => {
  assert.deepEqual(checkTranslation(original, translated(), 'es'), ['language is "en", expected "es"']);
});

test('an empty translation is missing every message', () => {
  const findings = checkTranslation(original, { ...translated(), messages: [] }, 'en');
  assert.deepEqual(findings, [
    '[1](https://fonteviva.org/livro/1/) is missing',
    '[2](https://fonteviva.org/livro/2/) is missing',
    '[3](https://fonteviva.org/livro/3/) is missing',
  ]);
});

test('a missing message is reported, the others are still in order', () => {
  const translation = translated();
  translation.messages.splice(1, 1);
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['[2](https://fonteviva.org/livro/2/) is missing']);
});

test('messages in another order are reported once', () => {
  const translation = translated();
  translation.messages.reverse();
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['messages are not in the order of pt.json']);
});

test('a duplicated message and one not in the original are reported', () => {
  const translation = translated();
  translation.messages.push(message(3, ['Only.']), message(4, ['Extra.']));
  assert.deepEqual(checkTranslation(original, translation, 'en'), [
    '[3](https://fonteviva.org/livro/3/) appears more than once',
    '[4](https://fonteviva.org/livro/4/) is not in pt.json',
  ]);
});

test('a kept field must not be translated', () => {
  const translation = translated();
  translation.messages[0].book = 'Book';
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['[1](https://fonteviva.org/livro/1/) book changed from "Livro" to "Book"']);
});

test('a field added or left out is reported', () => {
  const translation = translated();
  delete (translation.messages[0] as Record<string, unknown>).signature;
  assert.match(checkTranslation(original, translation, 'en')[0], /has the fields .*, expected .*signature/);
});

test('the number of paragraphs must match', () => {
  const translation = translated();
  translation.messages[1].paragraphs.pop();
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['[2](https://fonteviva.org/livro/2/) has 1 paragraphs, expected 2']);
});

test('a note must be kept, and not added', () => {
  const translation = translated();
  translation.messages[1].note = null;
  translation.messages[2].note = 'Note.';
  assert.deepEqual(checkTranslation(original, translation, 'en'), [
    '[2](https://fonteviva.org/livro/2/) lost its note',
    '[3](https://fonteviva.org/livro/3/) has a note the original does not have',
  ]);
});

test('a paragraph left in Portuguese is reported from 5 words on', () => {
  const fourWords = 'De salvador a desamparado';
  const fiveWords = 'E ele chamou os doze';
  const source: Content = { language: 'pt', books: [], messages: [message(1, [fourWords, fiveWords])] };
  const translation: Content = { language: 'es', books: [], messages: [message(1, [fourWords, fiveWords])] };
  assert.deepEqual(checkTranslation(source, translation, 'es'), [`[1](https://fonteviva.org/livro/1/) paragraph 2 is still in Portuguese: "${fiveWords}"`]);
});

test('a paragraph is still in Portuguese when 90% of its words are', () => {
  const original = 'um dois três quatro cinco seis sete oito nove dez';
  const ninetyPercent = 'um dois três quatro cinco seis sete oito nove ten';
  const eightyPercent = 'um dois três quatro cinco seis sete oito nine ten';
  const source: Content = { language: 'pt', books: [], messages: [message(1, [original, original])] };
  const translation: Content = { language: 'en', books: [], messages: [message(1, [ninetyPercent, eightyPercent])] };
  assert.deepEqual(checkTranslation(source, translation, 'en'), [`[1](https://fonteviva.org/livro/1/) paragraph 1 is still in Portuguese: "${ninetyPercent}"`]);
});

test('a note left in Portuguese is reported', () => {
  const note = 'Esta mensagem foi publicada originalmente em 1950';
  const source: Content = { language: 'pt', books: [], messages: [message(1, ['Um.'], note)] };
  const translation: Content = { language: 'en', books: [], messages: [message(1, ['One.'], note)] };
  assert.deepEqual(checkTranslation(source, translation, 'en'), [`[1](https://fonteviva.org/livro/1/) note is still in Portuguese: "${note}"`]);
});

test('an epigraph more than 1.5 times longer than the original is reported', () => {
  const source: Content = { language: 'pt', books: [], messages: [message(1, ['“' + 'x'.repeat(9)])] }; // 10 characters
  const at15: Content = { language: 'en', books: [], messages: [message(1, ['“' + 'y'.repeat(14)])] };
  const at16: Content = { language: 'en', books: [], messages: [message(1, ['“' + 'y'.repeat(15)])] };
  assert.deepEqual(checkTranslation(source, at15, 'en'), []);
  assert.match(checkTranslation(source, at16, 'en')[0], /epigraph is 16 characters, the original 10/);
});

test('every translation in content/ passes the check', () => {
  const pt: Content = JSON.parse(readFileSync('content/pt.json', 'utf8'));
  for (const file of readdirSync('content').filter((f) => f.endsWith('.json') && f !== 'pt.json')) {
    const translation: Content = JSON.parse(readFileSync(`content/${file}`, 'utf8'));
    assert.deepEqual(checkTranslation(pt, translation, file.replace('.json', '')), [], `${file}: run node scripts/check-translations.ts`);
  }
});

test('a book name left in Portuguese is reported (#115)', () => {
  const translation = translated();
  translation.books[1].name = 'Luz';
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['book name "Luz" is still in Portuguese']);
});

test('a book missing from the translation is reported', () => {
  const translation = translated();
  translation.books.pop();
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['book "luz" is missing']);
});

test('a translation without books is missing every book', () => {
  const findings = checkTranslation(original, { ...translated(), books: [] }, 'en');
  assert.deepEqual(findings, ['book "livro" is missing', 'book "luz" is missing']);
});

test('a book that is not in pt.json is reported', () => {
  const translation = translated();
  translation.books.push({ slug: 'novo', name: 'New' });
  assert.deepEqual(checkTranslation(original, translation, 'en'), ['book "novo" is not in pt.json']);
});
