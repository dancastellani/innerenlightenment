import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findMessage, languageFor, originalLink } from './language.ts';
import type { Message } from '../scripts/parse-message.ts';

test('UC-05.1: English when the phone is not Portuguese', () => {
  assert.equal(languageFor('en-US'), 'en');
  assert.equal(languageFor('de-DE'), 'en');
});

test('UC-05.2, UC-05.5: Portuguese for any Portuguese variant', () => {
  assert.equal(languageFor('pt'), 'pt');
  assert.equal(languageFor('pt-BR'), 'pt');
  assert.equal(languageFor('pt-PT'), 'pt');
});

test('UC-05.6: a language the app does not have yet falls back to English', () => {
  assert.equal(languageFor('es-ES'), 'en');
  assert.equal(languageFor(''), 'en');
});

const message = (id: number, title: string) => ({ id, title }) as Message;
const original = [message(1, 'O tempo'), message(2, 'Filhos e servos')];
const english = [message(1, 'Time')];

test('UC-05.3: the message in the chosen language', () => {
  assert.equal(findMessage(1, english, original)?.title, 'Time');
  assert.equal(findMessage(1, original, original)?.title, 'O tempo');
});

test('UC-05.7: a message missing from the translation is shown in Portuguese', () => {
  assert.equal(findMessage(2, english, original)?.title, 'Filhos e servos');
});

test('UC-05.7 boundary: an unknown message or none at all is not found', () => {
  assert.equal(findMessage(999, english, original), undefined);
  assert.equal(findMessage(undefined, english, original), undefined);
  assert.equal(findMessage(1, [], []), undefined);
});

const url = 'https://fonteviva.org/caminho-verdade-e-vida/filhos-e-servos/';

test('UC-07.1: Portuguese opens the original page', () => {
  assert.equal(originalLink(url, 'pt'), url);
});

test('UC-07.2: English opens the page through Google Translate', () => {
  assert.equal(
    originalLink(url, 'en'),
    'https://fonteviva-org.translate.goog/caminho-verdade-e-vida/filhos-e-servos/?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp',
  );
});
