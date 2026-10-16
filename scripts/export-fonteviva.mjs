// Exports every message from fonteviva.org (WordPress REST API) to content/pt.json.
// Usage: node scripts/export-fonteviva.mjs [output-path]

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseMessage, toText } from './parse-message.mjs';

const API = 'https://fonteviva.org/wp-json/wp/v2';
const OUTPUT = process.argv[2] ?? 'content/pt.json';

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'innerenlightenment-export' } });
    if (res.ok) return { data: await res.json(), headers: res.headers };
    if (attempt >= 4 || res.status < 500) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

async function fetchAll(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const { data, headers } = await getJson(`${API}/${path}${sep}per_page=100&page=${page}`);
    items.push(...data);
    const totalPages = Number(headers.get('x-wp-totalpages') ?? 1);
    console.error(`${path}: page ${page}/${totalPages}`);
    if (page >= totalPages) return items;
  }
}

const categories = await fetchAll('categories?_fields=id,name,slug,count');
const books = categories
  .filter((c) => c.count > 0)
  .map((c) => ({ id: c.id, slug: c.slug, name: toText(c.name), count: c.count }));
const bookById = new Map(books.map((b) => [b.id, b]));

const posts = await fetchAll('posts?_fields=id,slug,link,title,categories,content&orderby=id&order=asc');
const messages = posts.map((post) => {
  const book = post.categories.map((id) => bookById.get(id)).find(Boolean);
  return parseMessage(post, book?.slug ?? null);
});

const problems = messages.filter((m) => !m.book || m.paragraphs.length === 0);
for (const m of problems) console.error(`warning: ${m.url} has no book or no body`);

const output = {
  source: 'https://fonteviva.org/',
  language: 'pt',
  books: books.map(({ slug, name, count }) => ({ slug, name, count })),
  messages,
};

await mkdir(dirname(OUTPUT), { recursive: true });
const json = JSON.stringify(output, null, 1);
await writeFile(OUTPUT, json + '\n');
console.error(`wrote ${messages.length} messages (${(Buffer.byteLength(json) / 1024).toFixed(0)} KB) to ${OUTPUT}`);
