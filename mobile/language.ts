import type { Message } from '../scripts/parse-message';

export type Book = { slug: string; name: string };

// UC-05: the languages bundled in the app. Portuguese is the original; English is the default.
export type Language = 'en' | 'pt';

// UC-05.1, UC-05.2, UC-05.5, UC-05.6: Portuguese for any Portuguese phone, otherwise English.
export function languageFor(locale: string): Language {
  return locale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

// UC-05.7: the message in the chosen language, or the Portuguese original when it has no translation.
export function findMessage(id: number | undefined, translated: Message[], original: Message[]): Message | undefined {
  return translated.find((m) => m.id === id) ?? original.find((m) => m.id === id);
}

// UC-05.10: the name of a book in the chosen language, or in Portuguese when it has no translation.
export function bookName(slug: string, translated: Book[], original: Book[]): string {
  return (translated.find((b) => b.slug === slug) ?? original.find((b) => b.slug === slug))?.name ?? '';
}

// UC-07: the page on fonteviva.org, through Google Translate for languages other than Portuguese.
export function originalLink(url: string, language: string): string {
  if (language === 'pt') return url;
  const translated = url.replace('https://fonteviva.org/', 'https://fonteviva-org.translate.goog/');
  return `${translated}?_x_tr_sl=pt&_x_tr_tl=${language}&_x_tr_hl=${language}&_x_tr_pto=wapp`;
}

// UC-18.1: each translated paragraph followed by the same paragraph of the Portuguese original,
// as study groups compare them. Paragraphs left over on either side come at the end.
export function withOriginal(translated: string[], original: string[]): { text: string; isOriginal: boolean }[] {
  const result = [];
  for (let i = 0; i < Math.max(translated.length, original.length); i++) {
    if (i < translated.length) result.push({ text: translated[i], isOriginal: false });
    if (i < original.length) result.push({ text: original[i], isOriginal: true });
  }
  return result;
}
