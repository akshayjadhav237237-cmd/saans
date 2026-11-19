import { buildSanitizedPayload, DISCLOSURE_DESCRIPTIONS } from '../../ai/payload';
import type { SanitizedPayload } from '../../ai/port';
import type { AirQualityData } from '../../data/types';
import { getAqiResult } from '../../domain/aqi';
import type { DayPlan, HouseholdProfile } from '../../domain/types';
import type { Language, TranslationKey } from '../../i18n';
import { translate } from '../../i18n';

export const MAX_QUESTION_LENGTH = 280;

export const EXAMPLE_QUESTION_KEYS = ['ask.example.1', 'ask.example.2', 'ask.example.3'] as const;

export type ExampleQuestionKey = (typeof EXAMPLE_QUESTION_KEYS)[number];
export type ProviderMode = 'local' | 'gemini';

export interface DisclosureItem {
  readonly field: string;
  readonly descriptionKey: string;
  readonly description: string;
}

export interface BuildPayloadStateInput {
  readonly profile: HouseholdProfile;
  readonly language: Language;
  readonly airData: AirQualityData | null;
  readonly plan: DayPlan | null;
}

/** Determines whether the active AI provider is Local or Gemini based on the API key. */
export function getProviderMode(apiKey?: string): ProviderMode {
  return apiKey && apiKey.trim().length > 0 ? 'gemini' : 'local';
}

/** Resolves the translation key for the active provider mode indicator badge. */
export function getProviderModeKey(apiKey?: string): TranslationKey {
  return getProviderMode(apiKey) === 'gemini' ? 'ask.provider.gemini' : 'ask.provider.local';
}

/** Formats the localized provider mode label string for display. */
export function getProviderModeLabel(apiKey: string | undefined, lang: Language): string {
  return translate(lang, getProviderModeKey(apiKey));
}

/** Formats current question character count against the 280-character cap. */
export function formatCharacterCount(count: number, lang: Language): string {
  return translate(lang, 'ask.input.counter', { count });
}

/** Checks whether the question character count exceeds the 280-character limit. */
export function isCharacterLimitExceeded(count: number): boolean {
  return count > MAX_QUESTION_LENGTH;
}

/** Returns the list of localized example questions for quick input selection. */
export function getExampleQuestions(lang: Language): readonly string[] {
  return EXAMPLE_QUESTION_KEYS.map((key) => translate(lang, key));
}

/** Generates the list of localized data disclosures from system allowlist metadata. */
export function getDisclosureList(lang: Language): readonly DisclosureItem[] {
  return DISCLOSURE_DESCRIPTIONS.map((item) => {
    const key = item.descriptionKey as TranslationKey;
    return {
      field: item.field,
      descriptionKey: item.descriptionKey,
      description: translate(lang, key),
    };
  });
}

/** Builds sanitized privacy payload from store state with safe fallbacks. */
export function buildPayloadFromState(input: BuildPayloadStateInput): SanitizedPayload {
  const currentAqi = input.airData?.currentAqi ?? 100;
  const aqiResult = getAqiResult(currentAqi);
  const currentPm25 = input.airData?.currentPm25 ?? 60;

  if (input.plan) {
    return buildSanitizedPayload({
      profile: input.profile,
      aqiBandKey: aqiResult.labelKey,
      pm25: currentPm25,
      dayPlan: input.plan,
      language: input.language,
    });
  }

  const memberKinds = input.profile.members.map((m) => m.role);
  return {
    aqiBandKey: aqiResult.labelKey,
    roundedPm25: Math.round(currentPm25),
    memberKinds,
    actions: [],
    language: input.language,
  };
}
