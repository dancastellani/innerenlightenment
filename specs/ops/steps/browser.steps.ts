// Steps for OP-05 that open the built website in headless Chrome with Playwright,
// to check what only a browser shows: scripts running, links opening, the layout on a phone.
// The site is served straight from its folder at http://site.test/, so no web server is needed.

import { AfterAll, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

type World = { siteFolder: string; page: Page };

const siteUrl = 'http://site.test/';

// One browser for all scenarios, started by the first one that needs it.
let browser: Browser | undefined;

// The quoted values in a step, e.g. `"pt/" or "en/"` gives ["pt/", "en/"].
function quoted(text: string): string[] {
  return [...text.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
}

// Starting Chrome the first time can take longer than Cucumber's 5 seconds per step,
// and a step stopped while Chrome starts leaves it running, so the tests never end.
When('the page {string} is opened in a browser', { timeout: 30_000 }, async function (this: World, path: string) {
  // Uses the installed Google Chrome; CHROME_PATH points to another Chrome or Chromium instead.
  browser ??= await chromium.launch({ channel: 'chrome', executablePath: process.env.CHROME_PATH });
  // The smallest common phone screen.
  this.page = await browser.newPage({ viewport: { width: 320, height: 640 } });
  // Fails within Cucumber's 5 seconds per step, with Playwright's message saying what it waited for.
  this.page.setDefaultTimeout(3000);
  await this.page.route('**/*', async (route) => {
    const url = route.request().url();
    // Fonts and anything else outside the site are left out, so the tests don't need the internet.
    if (!url.startsWith(siteUrl)) return route.abort();
    let file = new URL(url).pathname;
    if (file.endsWith('/')) file += 'index.html';
    const contentType = file.endsWith('.css') ? 'text/css' : 'text/html';
    try {
      await route.fulfill({ body: await readFile(join(this.siteFolder, file)), contentType });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  await this.page.goto(siteUrl + path);
});

When('the link {string} is clicked', async function (this: World, name: string) {
  await this.page.getByRole('link', { name, exact: true }).click();
});

When('{string} is tapped', async function (this: World, text: string) {
  await this.page.getByText(text, { exact: true }).click();
});

// The menu button at the top right is an icon, found by its label.
// The favourite star is an icon, found by its label.
When('the star {string} is tapped', async function (this: World, label: string) {
  await this.page.getByLabel(label, { exact: true }).click();
});

Then('the star says {string}', async function (this: World, label: string) {
  await this.page.getByLabel(label, { exact: true }).waitFor();
});

When('the browser refuses to save data', async function (this: World) {
  await this.page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage is full');
    };
  });
});

When('the favourites saved in the browser are {string}', async function (this: World, ids: string) {
  await this.page.evaluate((saved) => localStorage.setItem('favourites', saved), ids);
  await this.page.reload();
});

When('the menu is tapped', async function (this: World) {
  await this.page.getByLabel('Menu').click();
});

When('the page is scrolled to the end', async function (this: World) {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

Then(/^(.+) (?:is|are) at the top of the screen$/, async function (this: World, texts: string) {
  for (const text of quoted(texts)) {
    const box = await this.page.getByText(text, { exact: true }).boundingBox();
    assert.ok(box && box.y >= 0 && box.y < 60, `"${text}" is at ${box?.y} pixels from the top`);
  }
});

Then(/^the browser shows (.+)$/, async function (this: World, texts: string) {
  for (const text of quoted(texts)) assert.ok(await this.page.getByText(text, { exact: true }).isVisible(), text);
});

Then(/^the browser does not show (.+)$/, async function (this: World, texts: string) {
  for (const text of quoted(texts)) assert.equal(await this.page.getByText(text, { exact: true }).isVisible(), false, text);
});

// The page may still be redirecting, so this waits until it is on one of the expected pages.
Then(/^the browser is on the page (.+)$/, async function (this: World, pages: string) {
  const expected = quoted(pages);
  await this.page.waitForURL((url) => expected.includes(url.href.replace(siteUrl, '')));
});

Then('every link on it to the website opens a page', async function (this: World) {
  const links = await this.page.locator('a').evaluateAll((elements) => elements.map((element) => (element as HTMLAnchorElement).href));
  const siteLinks = links.filter((link) => link.startsWith(siteUrl));
  assert.ok(siteLinks.length > 0, 'no links to the website');
  for (const link of siteLinks) {
    const response = await this.page.goto(link);
    assert.equal(response?.status(), 200, link);
  }
});

Then('it does not scroll sideways', async function (this: World) {
  const scrollWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(scrollWidth <= 320, `the page is ${scrollWidth} pixels wide`);
});

AfterAll(async function () {
  await browser?.close();
});
