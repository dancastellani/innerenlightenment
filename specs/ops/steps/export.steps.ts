// Steps for OP-01: the export runs against a small local server that serves saved sample data
// the way the fonteviva.org WordPress API does.

import { Given, When, Then, After } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCommand, type Result } from './run-command.ts';

type Site = {
  categories: { id: number; count: number }[];
  posts: { id: number; categories: number[]; content: { rendered: string } }[];
};

type World = {
  site: Site;
  perPage: number;
  broken: boolean;
  server: Server;
  output: string;
  result: Result;
};

function readOutput(world: World) {
  return JSON.parse(readFileSync(world.output, 'utf8'));
}

Given('the site has the saved sample of {int} messages in {int} books', function (this: World, messages: number, books: number) {
  this.site = JSON.parse(readFileSync('specs/ops/sample-data/fonteviva.json', 'utf8'));
  assert.equal(this.site.posts.length, messages);
  assert.equal(this.site.categories.filter((c) => c.count > 0).length, books);
  this.perPage = 100;
  this.broken = false;
});

Given('the site returns {int} messages per page', function (this: World, perPage: number) {
  this.perPage = perPage;
});

Given('message {int} has no book', function (this: World, id: number) {
  this.site.posts.find((p) => p.id === id)!.categories = [];
});

Given('message {int} has the paragraph {string}', function (this: World, id: number, html: string) {
  const post = this.site.posts.find((p) => p.id === id)!;
  post.content.rendered = post.content.rendered.replace(/<p\b/, `<p>${html}</p>\n<p`);
});

Given('the site answers every request with an error', function (this: World) {
  this.broken = true;
});

When('the export runs', async function (this: World) {
  // Serves /categories and /posts one page at a time, with the X-WP-TotalPages header like WordPress.
  this.server = createServer((request, response) => {
    if (this.broken) return response.writeHead(500).end();
    const url = new URL(request.url!, 'http://localhost');
    const items = url.pathname.endsWith('/categories') ? this.site.categories : this.site.posts;
    const perPage = url.pathname.endsWith('/categories') ? 100 : this.perPage;
    const page = Number(url.searchParams.get('page'));
    response.writeHead(200, { 'Content-Type': 'application/json', 'X-WP-TotalPages': Math.ceil(items.length / perPage) });
    response.end(JSON.stringify(items.slice((page - 1) * perPage, page * perPage)));
  });
  await new Promise<void>((resolve) => this.server.listen(0, resolve));
  const port = (this.server.address() as { port: number }).port;

  this.output = join(await mkdtemp(join(tmpdir(), 'export-')), 'pt.json');
  this.result = await runCommand('node', ['scripts/export-fonteviva.ts', this.output], {
    FONTEVIVA_API: `http://localhost:${port}/wp-json/wp/v2`,
  });
});

After({ tags: '@OP-01' }, function (this: World) {
  this.server?.close();
});

Then('the output has {int} messages', function (this: World, count: number) {
  assert.equal(readOutput(this).messages.length, count);
});

Then('every message has a book, title, chapter and body', function (this: World) {
  for (const m of readOutput(this).messages) {
    assert.ok(m.book && m.title && m.chapter && m.paragraphs.length > 0, `incomplete message ${m.url}`);
  }
});

Then(
  'message {int} has the title {string}, the chapter {string} and the signature {string}',
  function (this: World, id: number, title: string, chapter: string, signature: string) {
    const m = readOutput(this).messages.find((m: { id: number }) => m.id === id);
    assert.equal(m.title, title);
    assert.equal(m.chapter, chapter);
    assert.equal(m.signature, signature);
  },
);

Then(
  'the output lists the books {string} with {int} message and {string} with {int} messages',
  function (this: World, book1: string, count1: number, book2: string, count2: number) {
    const books = readOutput(this).books.map((b: { slug: string; count: number }) => [b.slug, b.count]);
    assert.deepEqual(books.sort(), [[book1, count1], [book2, count2]].sort());
  },
);

Then('the exported message {int} has the paragraph {string}', function (this: World, id: number, text: string) {
  const m = readOutput(this).messages.find((m: { id: number }) => m.id === id);
  assert.ok(m.paragraphs.includes(text), JSON.stringify(m.paragraphs));
});

Then('it warns about {string}', function (this: World, url: string) {
  assert.ok(this.result.output.includes(`warning: ${url}`), this.result.output);
});

Then('no output file is written', function (this: World) {
  assert.equal(existsSync(this.output), false);
});
