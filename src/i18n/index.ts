import { en, type TranslationKey } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';
export type { TranslationKey };

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = {
  en,
  hi,
};

/** Translates a message key into localized text with optional interpolation parameters. */
export function translate(
  lang: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES.en;
  let text: string = dict[key] ?? DICTIONARIES.en[key] ?? key;

  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }
  }

  return text;
}
