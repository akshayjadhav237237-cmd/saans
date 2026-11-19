import type { TranslationKey } from './en';
import { hiAdvisory } from './hi.advisory';
import { hiCore } from './hi.core';

export const hi: Record<TranslationKey, string> = {
  ...(hiCore as Record<TranslationKey, string>),
  ...(hiAdvisory as Record<TranslationKey, string>),
};
