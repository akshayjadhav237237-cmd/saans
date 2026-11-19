import type { AqiBand, CommunityAdvisory } from '../../domain/types';
import { translate, type Language, type TranslationKey } from '../../i18n';
import { en } from '../../i18n/en';

export type SchoolOutdoorBadge = 'PERMITTED' | 'RESTRICTED';

export interface SchoolStatusDisplay {
  readonly isPermitted: boolean;
  readonly badge: SchoolOutdoorBadge;
  readonly statusKey: TranslationKey;
  readonly statusText: string;
}

export interface CommunityActionDisplay {
  readonly key: string;
  readonly text: string;
  readonly description: string;
}

export interface CommunityViewModel {
  readonly city: string;
  readonly aqi: number;
  readonly band: AqiBand;
  readonly bandLabel: string;
  readonly headlineKey: string;
  readonly adviceKey: string;
  readonly headline: string;
  readonly advice: string;
  readonly schoolStatus: SchoolStatusDisplay;
  readonly actions: readonly CommunityActionDisplay[];
}

const BAND_LABEL_KEYS: Record<AqiBand, TranslationKey> = {
  good: 'aqi.band.good',
  moderate: 'aqi.band.moderate',
  unhealthy_sensitive: 'aqi.band.unhealthy_sensitive',
  unhealthy: 'aqi.band.unhealthy',
  very_unhealthy: 'aqi.band.very_unhealthy',
  hazardous: 'aqi.band.hazardous',
};

function isTranslationKey(key: string): key is TranslationKey {
  return key in en;
}

/** Resolves the localized display label for an AQI category band. */
export function toBandLabel(band: AqiBand, lang: Language): string {
  const key = BAND_LABEL_KEYS[band] ?? 'aqi.band.hazardous';
  return translate(lang, key);
}

/** Maps school outdoor permission flag to an accessible status display model. */
export function toSchoolStatusDisplay(permitted: boolean, lang: Language): SchoolStatusDisplay {
  const statusKey: TranslationKey = permitted
    ? 'community.school.permitted'
    : 'community.school.suspended';
  const badge: SchoolOutdoorBadge = permitted ? 'PERMITTED' : 'RESTRICTED';

  return {
    isPermitted: permitted,
    badge,
    statusKey,
    statusText: translate(lang, statusKey),
  };
}

/** Translates a list of community action keys into displayable action records. */
export function toCommunityActions(
  actionKeys: readonly string[],
  lang: Language,
): readonly CommunityActionDisplay[] {
  return actionKeys.map((key) => {
    const text = isTranslationKey(key) ? translate(lang, key) : key;
    return {
      key,
      text,
      description: text,
    };
  });
}

/** Maps a domain CommunityAdvisory model into a localized UI presentation viewmodel. */
export function toCommunityViewModel(
  advisory: CommunityAdvisory,
  lang: Language,
): CommunityViewModel {
  const headline = isTranslationKey(advisory.headlineKey)
    ? translate(lang, advisory.headlineKey)
    : advisory.headlineKey;
  const advice = isTranslationKey(advisory.adviceKey)
    ? translate(lang, advisory.adviceKey)
    : advisory.adviceKey;

  return {
    city: advisory.city,
    aqi: advisory.aqi,
    band: advisory.band,
    bandLabel: toBandLabel(advisory.band, lang),
    headlineKey: advisory.headlineKey,
    adviceKey: advisory.adviceKey,
    headline,
    advice,
    schoolStatus: toSchoolStatusDisplay(advisory.schoolOutdoorPermitted, lang),
    actions: toCommunityActions(advisory.communityActions, lang),
  };
}
