import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMessage, toText, type Post } from './parse-message.ts';

const post: Post = {
  id: 1485,
  slug: 'brilhe-vossa-luz',
  link: 'https://fonteviva.org/vinha-de-luz/brilhe-vossa-luz/',
  title: { rendered: 'Brilhe vossa luz' },
  categories: [7],
  content: {
    rendered: `<div class="Section1">
<div class="fonte">
<p class="capitulo">Pref&aacute;cio</p>
<p class="livro">Livro: Vinha de Luz</p>
<p class="espirito">Emmanuel</p>
<p class="autor">Francisco C&#226;ndido Xavier</p>
</div>
<div class="article">
<p>Primeiro par&#225;grafo,
com quebra.</p>
<!-- comentário -->
<p><em>Segundo</em> &#8220;par&aacute;grafo&#8221;.<br />Nova linha.</p>
<p class="assinatura">Emmanuel</p>
<p>Pedro Leopoldo, 25 de novembro de 1951.</p>
</div>
</div>`,
  },
};

test('parses header, body, signature and note', () => {
  const m = parseMessage(post, 'vinha-de-luz');
  assert.equal(m.title, 'Brilhe vossa luz');
  assert.equal(m.chapter, 'Prefácio');
  assert.equal(m.spirit, 'Emmanuel');
  assert.equal(m.medium, 'Francisco Cândido Xavier');
  assert.deepEqual(m.paragraphs, ['Primeiro parágrafo, com quebra.', 'Segundo “parágrafo”.\nNova linha.']);
  assert.equal(m.signature, 'Emmanuel');
  assert.equal(m.note, 'Pedro Leopoldo, 25 de novembro de 1951.');
  assert.equal(m.book, 'vinha-de-luz');
});

test('decodes entities', () => {
  assert.equal(toText('&#xE3;o &amp; &hellip; &Atilde;&ccedil; &unknown;'), 'ão & … Ãç &unknown;');
});
