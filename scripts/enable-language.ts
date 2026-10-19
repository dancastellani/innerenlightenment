// Enables a language: checks content/<lang>/ like the tests do and, only if nothing is wrong,
// adds the language and its name to content/languages.json.
// Usage: node scripts/enable-language.ts <lang> "<Name>" [folder]   (or ./run.sh enable <lang> "<Name>"; the folder is content by default)

import { existsSync, writeFileSync } from 'node:fs';
import { checkLanguage, enabledLanguages } from './check-translations.ts';

// Returns the problems that stop the language from being enabled; none means it was added.
export function enableLanguage(folder: string, lang: string, name: string): string[] {
  const languages = enabledLanguages(folder);
  if (languages[lang]) return [`${lang} is already enabled`];
  if (!existsSync(`${folder}/${lang}/messages.json`)) return [`${folder}/${lang}/messages.json does not exist`];
  const { findings } = checkLanguage(folder, lang);
  if (findings.length > 0) return findings;
  languages[lang] = { name };
  const lines = Object.entries(languages).map(([code, language]) => `  ${JSON.stringify(code)}: { "name": ${JSON.stringify(language.name)} }`);
  writeFileSync(`${folder}/languages.json`, `{\n${lines.join(',\n')}\n}\n`);
  return [];
}

if (import.meta.main) {
  const [lang, name, folder = 'content'] = process.argv.slice(2);
  if (!lang || !name) {
    console.error('Usage: node scripts/enable-language.ts <lang> "<Name>"');
    process.exit(1);
  }
  const problems = enableLanguage(folder, lang, name);
  for (const problem of problems) console.error(`- ${problem}`);
  if (problems.length > 0) process.exit(1);
  console.log(`Enabled ${lang} (${name}) in ${folder}/languages.json`);
}
