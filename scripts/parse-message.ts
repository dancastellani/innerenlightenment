// Turns one fonteviva.org WordPress post into a clean message.
//
// Post HTML: a `.fonte` header with `p.capitulo`, `p.livro`, `p.espirito`, `p.autor`,
// then `.article` with body paragraphs, `p.assinatura`, and an optional place/date line.

export type Post = {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  categories: number[];
  content: { rendered: string };
};

export type Message = {
  id: number;
  slug: string;
  url: string;
  book: string | null;
  title: string;
  chapter: string | null;
  spirit: string | null;
  medium: string | null;
  paragraphs: string[];
  signature: string | null;
  note: string | null;
};

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', ordf: 'ª', ordm: 'º',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', agrave: 'à',
  acirc: 'â', ecirc: 'ê', ocirc: 'ô', atilde: 'ã', otilde: 'õ', ccedil: 'ç', uuml: 'ü',
};

function decodeEntity(entity: string, code: string): string {
  if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(parseInt(code.slice(2), 16));
  if (code.startsWith('#')) return String.fromCodePoint(parseInt(code.slice(1), 10));
  const lower = ENTITIES[code.toLowerCase()];
  if (lower === undefined) return entity;
  return code[0] === code[0].toUpperCase() ? lower.toUpperCase() : lower; // &Atilde; -> Ã
}

// Strips tags from an HTML fragment, keeping <br> as a line break.
export function toText(html: string): string {
  const text = html
    .replace(/\s+/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity);
  return text.split('\n').map((line) => line.trim()).filter(Boolean).join('\n');
}

export function parseMessage(post: Post, book: string | null): Message {
  const paragraphs: { classes: string[]; text: string }[] = [];
  for (const [, attrs, inner] of post.content.rendered.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi)) {
    const text = toText(inner);
    const classes = /class="([^"]*)"/.exec(attrs)?.[1].split(/\s+/) ?? [];
    if (text) paragraphs.push({ classes, text });
  }

  const byClass = (name: string) => paragraphs.find((p) => p.classes.includes(name))?.text ?? null;
  const isHeader = (classes: string[]) => ['capitulo', 'livro', 'espirito', 'autor'].some((c) => classes.includes(c));

  const body: string[] = [];
  const after: string[] = [];
  let signature: string | null = null;
  for (const { classes, text } of paragraphs) {
    if (isHeader(classes)) continue;
    if (classes.includes('assinatura')) signature = text;
    else if (signature === null) body.push(text);
    else after.push(text);
  }

  return {
    id: post.id,
    slug: post.slug,
    url: post.link,
    book,
    title: toText(post.title.rendered),
    chapter: byClass('capitulo'),
    spirit: byClass('espirito'),
    medium: byClass('autor'),
    paragraphs: body,
    signature,
    note: after.join('\n') || null,
  };
}
