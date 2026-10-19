// Steps for OP-08: runs scripts/enable-language.ts and the translation check on a copy of content/.

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand, type Result } from './run-command.ts';

type World = { folder: string; result: Result };

Given('a content folder where only {string} and {string} are enabled and {string} is ready', function (this: World, a: string, b: string, ready: string) {
  this.folder = mkdtempSync(join(tmpdir(), 'content-'));
  for (const lang of [a, b, ready]) cpSync(join('content', lang), join(this.folder, lang), { recursive: true });
  const names = JSON.parse(readFileSync('content/languages.json', 'utf8'));
  writeFileSync(join(this.folder, 'languages.json'), JSON.stringify({ [a]: names[a], [b]: names[b] }));
});

Given('the {string} folder is missing its last message', function (this: World, lang: string) {
  const file = join(this.folder, lang, 'messages.json');
  const content = JSON.parse(readFileSync(file, 'utf8'));
  content.messages.pop();
  writeFileSync(file, JSON.stringify(content));
});

When('I enable {string} as {string}', async function (this: World, lang: string, name: string) {
  this.result = await runCommand('node', ['scripts/enable-language.ts', lang, name, this.folder]);
});

When('I run the translation check on the content folder', async function (this: World) {
  this.result = await runCommand('node', ['scripts/check-translations.ts', this.folder]);
});

Then('languages.json lists {string} with the name {string}', function (this: World, lang: string, name: string) {
  const languages = JSON.parse(readFileSync(join(this.folder, 'languages.json'), 'utf8'));
  assert.equal(languages[lang]?.name, name);
});

Then('languages.json does not list {string}', function (this: World, lang: string) {
  const languages = JSON.parse(readFileSync(join(this.folder, 'languages.json'), 'utf8'));
  assert.equal(languages[lang], undefined);
});
