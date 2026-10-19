import type { Message } from '../scripts/parse-message';

export type Book = { slug: string; name: string };

// UC-05: the languages bundled in the app. Portuguese is the original; English is the default.
export type Language = 'en' | 'pt';

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

// UC-06.1: the message's page on our website, in the language being used.
export function shareLink(slug: string, language: string): string {
  return `https://dancastellani.github.io/innerenlightenment/${language}/${slug}/`;
}

// UC-22: the Gemini gem the "AI Chat" link opens. Its link takes no prefilled text, so the message is copied first.
export const aiChatLink = 'https://gemini.google.com/gem/14Q1eUapad5Qf6nVN3wq8ecpF32rdifOq?usp=sharing';

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

// UC-05.8, UC-05.9: the app's text in the chosen language, with the English text for any label the language lacks.
export function completeLabels<T extends Record<string, string>>(english: T, labels: Record<string, string>): T {
  return { ...english, ...labels };
}

// UC-12: where the app downloads a language that is not built in: its messages and its labels.
export function contentUrl(language: string, name: 'messages' | 'labels'): string {
  return `https://raw.githubusercontent.com/dancastellani/innerenlightenment/main/content/${language}/${name}.json`;
}
