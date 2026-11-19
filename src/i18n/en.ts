import { enCore } from './en.core';
import { enAdvisory } from './en.advisory';

export const en = {
  ...enCore,
  ...enAdvisory,
} as const;

export type TranslationKey = keyof typeof en;
