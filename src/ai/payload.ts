import type { DayPlan, HouseholdProfile } from '../domain/types';
import type { SanitizedPayload } from './port';

export const DISCLOSED_FIELDS = [
  'aqiBandKey',
  'roundedPm25',
  'memberKinds',
  'actions',
  'language',
  'userQuestion',
] as const;

export type DisclosedField = (typeof DISCLOSED_FIELDS)[number];

export const DISCLOSURE_DESCRIPTIONS: readonly {
  readonly field: DisclosedField;
  readonly descriptionKey: string;
}[] = [
  { field: 'aqiBandKey', descriptionKey: 'ai.disclosure.aqi_band' },
  { field: 'roundedPm25', descriptionKey: 'ai.disclosure.rounded_pm25' },
  { field: 'memberKinds', descriptionKey: 'ai.disclosure.member_kinds' },
  { field: 'actions', descriptionKey: 'ai.disclosure.action_deltas' },
  { field: 'language', descriptionKey: 'ai.disclosure.language' },
  { field: 'userQuestion', descriptionKey: 'ai.disclosure.user_question' },
];

export interface BuildPayloadInput {
  readonly profile: HouseholdProfile;
  readonly aqiBandKey: string;
  readonly pm25: number;
  readonly dayPlan: DayPlan;
  readonly language: 'en' | 'hi';
}

/** Builds a strictly privacy-sanitized allowlist payload stripping all PII and geographic identifiers. */
export function buildSanitizedPayload(input: BuildPayloadInput): SanitizedPayload {
  const memberKinds = input.profile.members.map((m) => m.role);
  const actions = input.dayPlan.rankedActions.slice(0, 5).map((r) => ({
    id: r.action.id,
    deltaPercent: r.deltaPercent,
  }));

  return {
    aqiBandKey: input.aqiBandKey,
    roundedPm25: Math.round(input.pm25),
    memberKinds,
    actions,
    language: input.language,
  };
}
