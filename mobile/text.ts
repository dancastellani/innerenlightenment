import type { Message } from '../scripts/parse-message';

// content/pt.json is an exact copy of fonteviva.org, which writes some characters with their
// Windows-1252 codes (128 to 159), e.g. 133 for "…" and 146 for "’". Browsers show these codes
// as the Windows-1252 characters, so the app and the website do the same when they show the text.
// Codes 129, 141, 143, 144 and 157 have no character and stay as they are.
const WINDOWS_1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';

export function showWindows1252(text: string): string {
  return text.replace(/[\x80-\x9f]/g, (code) => WINDOWS_1252[code.charCodeAt(0) - 0x80]);
}

// The message with its text ready to show (bugs #67, #71).
export function readable(message: Message): Message {
  const show = (text: string | null) => (text === null ? null : showWindows1252(text));
  return {
    ...message,
    title: showWindows1252(message.title),
    chapter: show(message.chapter),
    paragraphs: message.paragraphs.map(showWindows1252),
    signature: show(message.signature),
    note: show(message.note),
  };
}
