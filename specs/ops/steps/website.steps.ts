// Steps for OP-05: builds the website from saved sample content into a temporary folder.

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand, type Result } from './run-command.ts';

type World = { contentFolder: string; siteFolder: string; result: Result };

// The quoted values in a step, e.g. `"pt/" and "en/"` gives ["pt/", "en/"].
function quoted(text: string): string[] {
  return [...text.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
}

function readPage(world: World, path: string): string {
  return readFileSync(join(world.siteFolder, path, 'index.html'), 'utf8');
}

Given('the saved sample content with {int} messages in Portuguese and {int} in English', function (this: World, pt: number, en: number) {
  this.contentFolder = 'specs/ops/sample-data/site-content';
  const count = (language: string) => JSON.parse(readFileSync(join(this.contentFolder, language, 'messages.json'), 'utf8')).messages.length;
  assert.equal(count('pt'), pt);
  assert.equal(count('en'), en);
});

Given('the content folder is empty', async function (this: World) {
  this.contentFolder = await mkdtemp(join(tmpdir(), 'content-'));
});

// Copies the English folder as a new language, with or without its labels.
async function addLanguage(world: World, language: string, withLabels: boolean) {
  const folder = await mkdtemp(join(tmpdir(), 'content-'));
  await cp(world.contentFolder, folder, { recursive: true });
  await cp(join(folder, 'en'), join(folder, language), { recursive: true });
  const messagesFile = join(folder, language, 'messages.json');
  await writeFile(messagesFile, JSON.stringify({ ...JSON.parse(readFileSync(messagesFile, 'utf8')), language }));
  if (!withLabels) await rm(join(folder, language, 'labels.json'));
  world.contentFolder = folder;
}

// UC-13.8: an English message that Spanish lacks, with the title "Extra".
Given('English has a message that Spanish does not have', async function (this: World) {
  const folder = await mkdtemp(join(tmpdir(), 'content-'));
  await cp(this.contentFolder, folder, { recursive: true });
  const messagesFile = join(folder, 'en', 'messages.json');
  const content = JSON.parse(readFileSync(messagesFile, 'utf8'));
  content.messages.push({ ...content.messages[0], id: 2, slug: 'extra', title: 'Extra' });
  await writeFile(messagesFile, JSON.stringify(content));
  this.contentFolder = folder;
});

Given('the content also has the language {string}', async function (this: World, language: string) {
  await addLanguage(this, language, true);
});

Given('the content also has the language {string} without labels', async function (this: World, language: string) {
  await addLanguage(this, language, false);
});

Given(
  'the Portuguese message {string} ends its first paragraph with the Windows-1252 code {int}',
  async function (this: World, slug: string, code: number) {
    const folder = await mkdtemp(join(tmpdir(), 'content-'));
    await cp(this.contentFolder, folder, { recursive: true });
    const content = JSON.parse(readFileSync(join(folder, 'pt', 'messages.json'), 'utf8'));
    content.messages.find((m: { slug: string }) => m.slug === slug).paragraphs[0] += String.fromCharCode(code);
    await writeFile(join(folder, 'pt', 'messages.json'), JSON.stringify(content));
    this.contentFolder = folder;
  },
);

When('the website is built', async function (this: World) {
  this.siteFolder = join(await mkdtemp(join(tmpdir(), 'site-')), 'site');
  this.result = await runCommand('node', ['scripts/build-site.ts', this.contentFolder, this.siteFolder]);
});

Then(/^there are pages (.+)$/, function (this: World, pages: string) {
  for (const page of quoted(pages)) assert.ok(existsSync(join(this.siteFolder, page, 'index.html')), page);
});

Then('there is no page {string}', function (this: World, page: string) {
  assert.ok(!existsSync(join(this.siteFolder, page)), page);
});

Then(/^the page "([^"]*)" contains (.+)$/, function (this: World, page: string, texts: string) {
  const html = readPage(this, page);
  for (const text of quoted(texts)) assert.ok(html.includes(text), text);
});

Then(/^the page "([^"]*)" does not contain (.+)$/, function (this: World, page: string, texts: string) {
  const html = readPage(this, page);
  for (const text of quoted(texts)) assert.ok(!html.includes(text), text);
});

Then('the page {string} has {string} only once', function (this: World, page: string, text: string) {
  assert.equal(readPage(this, page).split(text).length - 1, 1, text);
});

Then(/^the page "([^"]*)" links to (.+)$/, function (this: World, page: string, links: string) {
  const html = readPage(this, page);
  // In HTML a link's "&" is written "&amp;".
  for (const link of quoted(links)) assert.ok(html.includes(`href="${link.replaceAll('&', '&amp;')}"`), link);
});

Then(/^the page "([^"]*)" does not link to (.+)$/, function (this: World, page: string, links: string) {
  const html = readPage(this, page);
  for (const link of quoted(links)) assert.ok(!html.includes(`href="${link}"`), link);
});

Then('the page {string} has no signature', function (this: World, page: string) {
  assert.ok(!readPage(this, page).includes('class="signature"'));
});

// The page picks one of these slugs at random in the browser; here we check it has exactly them.
Then(/^the page "([^"]*)" opens a random message of "([^"]*)" from (.+)$/, function (this: World, page: string, prefix: string, slugs: string) {
  const html = readPage(this, page);
  assert.ok(html.includes(`const slugs = ${JSON.stringify(quoted(slugs))};`), html);
  assert.ok(html.includes(`location.replace('${prefix}' + `), html);
});

Then(/^without JavaScript the page "([^"]*)" links to (.+)$/, function (this: World, page: string, links: string) {
  const noscript = readPage(this, page).split('<noscript>')[1];
  for (const link of quoted(links)) assert.ok(noscript.includes(`href="${link}"`), link);
});

function labelsOf(language: string): Record<string, string> {
  return JSON.parse(readFileSync(`content/${language}/labels.json`, 'utf8'));
}

function languagesInContent(): string[] {
  return readdirSync('content', { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

Then('every language in content\\/ has a {string}', function (label: string) {
  for (const language of languagesInContent()) assert.ok(labelsOf(language)[label], `${language} has no ${label}`);
});

Then('every language but {string} in content\\/ has a {string}', function (original: string, label: string) {
  for (const language of languagesInContent()) {
    if (language !== original) assert.ok(labelsOf(language)[label], `${language} has no ${label}`);
  }
});

Then('every language in content\\/languages.json has a name', function () {
  const names = JSON.parse(readFileSync('content/languages.json', 'utf8'));
  for (const language of languagesInContent()) assert.ok(names[language]?.name, `${language} has no name`);
});

Then('the page {string} marks {string} as the selected language', function (this: World, page: string, language: string) {
  const html = readPage(this, page);
  assert.ok(html.includes(`<strong class="current" aria-current="true">${language}</strong>`), html);
  assert.equal(html.split('aria-current').length - 1, 1, 'exactly one selected language');
});

Then('the page {string} has the link {string} to {string}', function (this: World, page: string, text: string, link: string) {
  assert.ok(readPage(this, page).includes(`<a href="${link}">${text}</a>`));
});

Then(
  'the page {string} has the link {string} to {string} before the first message',
  function (this: World, page: string, text: string, link: string) {
    const html = readPage(this, page);
    const position = html.indexOf(`<a href="${link}">${text}</a>`);
    assert.ok(position >= 0 && position < html.indexOf('<h2'), html);
  },
);

Then('the page {string} has the book heading {string}', function (this: World, page: string, id: string) {
  assert.ok(readPage(this, page).includes(`<h2 id="${id}">`));
});
