import type { Clock, IdGen } from '../domain/ports';
import type { DayPlan, HouseholdProfile } from '../domain/types';
import type { Language } from '../i18n';

export interface IcsEventInput {
  readonly uid: string;
  readonly dtstamp: string;
  readonly startUtc: string;
  readonly endUtc: string;
  readonly summary: string;
  readonly description: string;
  readonly location?: string | undefined;
}

export interface IcsCalendarOptions {
  readonly clock: Clock;
  readonly idGen: IdGen;
  readonly plan: DayPlan;
  readonly language: Language;
  readonly cityName?: string | undefined;
}

export interface TextPlanOptions {
  readonly plan: DayPlan;
  readonly language: Language;
  readonly profile?: HouseholdProfile | undefined;
  readonly cityName?: string | undefined;
}

export interface GeneratedExport {
  readonly filename: string;
  readonly content: string;
  readonly mimeType: string;
}
