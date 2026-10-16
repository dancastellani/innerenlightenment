// Steps for OP-05 that open the built website in headless Chrome with Playwright,
// to check what only a browser shows: scripts running, links opening, the layout on a phone.
// The site is served straight from its folder at http://site.test/, so no web server is needed.

import { After, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

type World = { siteFolder: string; browser?: Browser; page: Page };

const siteUrl = 'http://site.test/';

// The quoted values in a step, e.g. `"pt/" or "en/"` gives ["pt/", "en/"].
function quoted(text: string): string[] {
  return [...text.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
}

When('the page {string} is opened in a browser', async function (this: World, path: string) {
  // Uses the installed Google Chrome; CHROME_PATH points to another Chrome or Chromium instead.
  this.browser = await chromium.launch({ channel: 'chrome', executablePath: process.env.CHROME_PATH });
  // The smallest common phone screen.
  this.page = await this.browser.newPage({ viewport: { width: 320, height: 640 } });
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

After(async function (this: World) {
  await this.browser?.close();
});
