import type { AirQualityData, GeoLocation } from '../data/types';
import type { DayPlan, HouseholdProfile } from '../domain/types';
import type { Language } from '../i18n';

export interface LocationSlice {
  readonly selectedCity: GeoLocation | null;
  readonly setSelectedCity: (city: GeoLocation | null) => void;
}

export interface AirDataSlice {
  readonly airData: AirQualityData | null;
  readonly isAirLoading: boolean;
  readonly airError: string | null;
  readonly setAirData: (data: AirQualityData | null) => void;
  readonly setAirLoading: (loading: boolean) => void;
  readonly setAirError: (err: string | null) => void;
}

export interface HouseholdSlice {
  readonly profile: HouseholdProfile;
  readonly setProfile: (profile: HouseholdProfile) => void;
}

export interface PlanSlice {
  readonly plan: DayPlan | null;
  readonly setPlan: (plan: DayPlan | null) => void;
}

export interface LanguageSlice {
  readonly language: Language;
  readonly setLanguage: (lang: Language) => void;
}

export interface AiKeySlice {
  readonly aiKey: string;
  readonly setAiKey: (key: string) => void;
  readonly clearAiKey: () => void;
}

export type AppStoreState = LocationSlice &
  AirDataSlice &
  HouseholdSlice &
  PlanSlice &
  LanguageSlice &
  AiKeySlice;
