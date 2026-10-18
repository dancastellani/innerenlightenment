import { File, Paths } from 'expo-file-system';
import type { Message } from '../scripts/parse-message';
import { contentUrl } from './language';

type Content = { messages: Message[]; labels: Record<string, string> };

// Reads a language file from the phone, downloading it from the repo first when it isn't saved yet.
async function readFile<T>(language: string, name: 'messages' | 'labels'): Promise<T> {
  const file = new File(Paths.document, `${language}.${name}.json`);
  if (!file.exists) await File.downloadFileAsync(contentUrl(language, name), file);
  try {
    return JSON.parse(await file.text());
  } catch (error) {
    // UC-12.5: a cut-off download is not valid JSON; remove it so the next try downloads again.
    file.delete();
    throw error;
  }
}

// UC-12: a language that is not in the app. Its messages are needed; its labels are not, so when they
// can't be had the app shows English text (UC-12.9) and tries again the next time.
export async function loadLanguage(language: string): Promise<Content> {
  const { messages } = await readFile<{ messages: Message[] }>(language, 'messages');
  const labels = await readFile<Record<string, string>>(language, 'labels').catch(() => ({}));
  return { messages, labels };
}

// UC-12.1: whether choosing the language still needs a download.
export function isDownloaded(language: string): boolean {
  return new File(Paths.document, `${language}.messages.json`).exists;
}
