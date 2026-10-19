// Takes a phone-sized screenshot of the app's web build (mobile/dist, from `npx expo export -p web`).
// Usage: node scripts/screenshot-app.ts <output.png> [text to click, in order...]
// Uses the installed Chrome; CHROME_PATH points to another Chrome or Chromium instead (e.g. /opt/pw-browsers/chromium).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const [output, ...clicks] = process.argv.slice(2);
if (!output) {
  console.error('Usage: node scripts/screenshot-app.ts <output.png> [text to click, in order...]');
  process.exit(1);
}

const distFolder = 'mobile/dist';
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.ico': 'image/x-icon' };

const server = createServer(async (request, response) => {
  const path = request.url === '/' ? '/index.html' : request.url!.split('?')[0];
  try {
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(await readFile(join(distFolder, path)));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise<void>((resolve) => server.listen(0, resolve));
const { port } = server.address() as { port: number };

const browser = await chromium.launch({ channel: process.env.CHROME_PATH ? undefined : 'chrome', executablePath: process.env.CHROME_PATH });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${port}/`);
await page.waitForLoadState('networkidle');
for (const text of clicks) {
  await page.getByText(text, { exact: true }).first().click();
  await page.waitForLoadState('networkidle');
}
await page.screenshot({ path: output });

await browser.close();
server.close();
