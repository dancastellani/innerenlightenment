import { File, Paths } from 'expo-file-system';
import type { Message } from '../scripts/parse-message';

type Content = { messages: Message[]; labels?: Record<string, string> };
import { contentUrl } from './language';

// UC-12: a language that is not in the app, read from the phone or downloaded from the repo once and saved.
// A file downloaded before languages had labels has none; the app then shows English text.
export async function loadLanguage(language: string): Promise<Content> {
  const file = new File(Paths.document, `${language}.json`);
  if (!file.exists) await File.downloadFileAsync(contentUrl(language), file);
  try {
    return JSON.parse(await file.text());
  } catch (error) {
    // UC-12.5: a cut-off download is not valid JSON; remove it so the next try downloads again.
    file.delete();
    throw error;
  }
}

// UC-12.1: whether choosing the language still needs a download.
export function isDownloaded(language: string): boolean {
  return new File(Paths.document, `${language}.json`).exists;
}
