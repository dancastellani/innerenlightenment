// Turns one fonteviva.org WordPress post into a clean message object.
//
// Post HTML looks like:
//   <div class="Section1">
//     <div class="fonte">
//       <p class="capitulo">…</p> <p class="livro">Livro: …</p>
//       <p class="espirito">…</p> <p class="autor">…</p>
//     </div>
//     <div class="article"> <p>…</p> … <p class="assinatura">…</p> <p>…</p> </div>
//   </div>

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  ndash: '–', mdash: '—', hellip: '…', middot: '·', ordf: 'ª', ordm: 'º',
};

// Accented letters used in Portuguese, e.g. &aacute; &Atilde; &ccedil;.
const ACCENTS = { acute: '\u0301', grave: '\u0300', circ: '\u0302', tilde: '\u0303', uml: '\u0308', cedil: '\u0327' };
for (const letter of 'aeioucnAEIOUCN') {
  for (const [name, mark] of Object.entries(ACCENTS)) {
    const composed = (letter + mark).normalize('NFC');
    if (composed.length === 1) NAMED_ENTITIES[letter + name] = composed;
  }
}

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code] ?? NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function toText(html) {
  const text = html
    .replace(/\s+/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(text)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

function paragraphs(html) {
  const result = [];
  const re = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html))) {
    const cls = /class\s*=\s*["']([^"']*)["']/i.exec(m[1])?.[1].trim() ?? '';
    const text = toText(m[2]);
    if (text) result.push({ cls, text });
  }
  return result;
}

export function parseMessage(post, bookName) {
  const html = post.content.rendered.replace(/<!--[\s\S]*?-->/g, '');
  const all = paragraphs(html);
  const byClass = (name) => all.find((p) => p.cls.split(/\s+/).includes(name))?.text ?? null;
  const headerClasses = ['capitulo', 'livro', 'espirito', 'autor'];

  const body = [];
  let signature = null;
  const afterSignature = [];
  for (const p of all) {
    const classes = p.cls.split(/\s+/);
    if (classes.some((c) => headerClasses.includes(c))) continue;
    if (classes.includes('assinatura')) {
      signature = p.text;
    } else if (signature === null) {
      body.push(p.text);
    } else {
      afterSignature.push(p.text);
    }
  }

  return {
    id: post.id,
    slug: post.slug,
    url: post.link,
    book: bookName,
    title: toText(post.title.rendered),
    chapter: byClass('capitulo'),
    spirit: byClass('espirito'),
    medium: byClass('autor'),
    paragraphs: body,
    signature,
    note: afterSignature.length ? afterSignature.join('\n') : null,
  };
}
