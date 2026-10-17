import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readable, showWindows1252 } from './text.ts';
import type { Message } from '../scripts/parse-message.ts';

test('#67, #71: codes 133 and 146 show as "…" and "’"', () => {
  assert.equal(showWindows1252('reencarnações\u0085 Os homens d\u0092outrora'), 'reencarnações… Os homens d’outrora');
});

test('#67 boundary: both ends of the range are converted, the codes just outside are not', () => {
  assert.equal(showWindows1252('\u0080\u009f'), '€Ÿ');
  assert.equal(showWindows1252('\u007f '), '\u007f ');
  assert.equal(showWindows1252(''), '');
});

test('#67: the table matches the Windows-1252 decoder for all 32 codes', () => {
  for (let code = 0x80; code <= 0x9f; code++) {
    assert.equal(showWindows1252(String.fromCharCode(code)), new TextDecoder('windows-1252').decode(new Uint8Array([code])));
  }
});

test('#67: every text of a message is shown readable, and missing ones stay missing', () => {
  const message = {
    id: 1,
    title: 'a\u0085',
    chapter: null,
    paragraphs: ['b\u0085', 'c\u0092'],
    signature: 'd\u0085',
    note: null,
  } as Message;
  const shown = readable(message);
  assert.deepEqual([shown.title, shown.chapter, shown.paragraphs, shown.signature, shown.note], ['a…', null, ['b…', 'c’'], 'd…', null]);
});
