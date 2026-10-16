// Steps for OP-05: builds the website from saved sample content into a temporary folder.

import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { cp, mkdtemp, writeFile } from 'node:fs/promises';
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
  const count = (language: string) => JSON.parse(readFileSync(join(this.contentFolder, `${language}.json`), 'utf8')).messages.length;
  assert.equal(count('pt'), pt);
  assert.equal(count('en'), en);
});

Given('the content folder is empty', async function (this: World) {
  this.contentFolder = await mkdtemp(join(tmpdir(), 'content-'));
});

Given('the content also has the language {string}', async function (this: World, language: string) {
  const folder = await mkdtemp(join(tmpdir(), 'content-'));
  await cp(this.contentFolder, folder, { recursive: true });
  const content = JSON.parse(readFileSync(join(folder, 'en.json'), 'utf8'));
  await writeFile(join(folder, `${language}.json`), JSON.stringify({ ...content, language }));
  this.contentFolder = folder;
});

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

Then(/^the page "([^"]*)" links to (.+)$/, function (this: World, page: string, links: string) {
  const html = readPage(this, page);
  for (const link of quoted(links)) assert.ok(html.includes(`href="${link}"`), link);
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

Then('every language but {string} in website\\/languages.json has a {string}', function (original: string, label: string) {
  const labels = JSON.parse(readFileSync('website/languages.json', 'utf8'));
  for (const [language, values] of Object.entries(labels)) {
    if (language !== original) assert.ok((values as Record<string, string>)[label], `${language} has no ${label}`);
  }
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
