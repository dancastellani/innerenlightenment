// Exports every message from fonteviva.org (WordPress REST API) to JSON.
// Usage: node scripts/export-fonteviva.ts [output-path]   (default: content/pt/messages.json)

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseMessage, toText, type Post } from './parse-message.ts';

// FONTEVIVA_API lets the specs point the export at saved sample data instead of the real site.
const API = process.env.FONTEVIVA_API ?? 'https://fonteviva.org/wp-json/wp/v2';

type Category = { id: number; name: string; slug: string; count: number };

async function fetchAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const response = await fetch(`${API}/${path}&per_page=100&page=${page}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${path}`);
    items.push(...(await response.json()));
    totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);
    console.error(`${path}: page ${page}/${totalPages}`);
  }
  return items;
}

const output = process.argv[2] ?? 'content/pt/messages.json';

const categories = await fetchAll<Category>('categories?_fields=id,name,slug,count');
const books = categories.filter((c) => c.count > 0);

const posts = await fetchAll<Post>('posts?_fields=id,slug,link,title,categories,content&orderby=id&order=asc');
const messages = posts.map((post) => {
  const book = books.find((b) => post.categories.includes(b.id));
  const message = parseMessage(post, book?.slug ?? null);
  if (!message.book || message.paragraphs.length === 0) console.error(`warning: ${message.url} has no book or no body`);
  return message;
});

const json = JSON.stringify(
  {
    source: 'https://fonteviva.org/',
    language: 'pt',
    books: books.map((b) => ({ slug: b.slug, name: toText(b.name), count: b.count })),
    messages,
  },
  null,
  1,
);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, json + '\n');
console.error(`wrote ${messages.length} messages (${Math.round(Buffer.byteLength(json) / 1024)} KB) to ${output}`);
