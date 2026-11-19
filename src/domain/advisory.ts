import type { AdvisoryInput, CommunityAdvisory } from './types';

const BAND_ADVISORY_KEYS = {
  good: {
    headlineKey: 'advisory.good.headline',
    adviceKey: 'advisory.good.advice',
    schoolOutdoorPermitted: true,
    actions: ['advisory.action.routine_maintenance', 'advisory.action.promote_cycling'],
  },
  moderate: {
    headlineKey: 'advisory.moderate.headline',
    adviceKey: 'advisory.moderate.advice',
    schoolOutdoorPermitted: true,
    actions: ['advisory.action.dust_suppression', 'advisory.action.anti_idling_monitoring'],
  },
  unhealthy_sensitive: {
    headlineKey: 'advisory.sensitive.headline',
    adviceKey: 'advisory.sensitive.advice',
    schoolOutdoorPermitted: false,
    actions: [
      'advisory.action.wet_sweeping',
      'advisory.action.indoor_recess',
      'advisory.action.stagger_office_hours',
    ],
  },
  unhealthy: {
    headlineKey: 'advisory.unhealthy.headline',
    adviceKey: 'advisory.unhealthy.advice',
    schoolOutdoorPermitted: false,
    actions: [
      'advisory.action.wet_sweeping',
      'advisory.action.halt_construction_dust',
      'advisory.action.stagger_office_hours',
      'advisory.action.community_clean_air_shelter',
    ],
  },
  very_unhealthy: {
    headlineKey: 'advisory.very_unhealthy.headline',
    adviceKey: 'advisory.very_unhealthy.advice',
    schoolOutdoorPermitted: false,
    actions: [
      'advisory.action.wet_sweeping',
      'advisory.action.halt_construction_dust',
      'advisory.action.mandatory_work_from_home',
      'advisory.action.community_clean_air_shelter',
      'advisory.action.emergency_smog_guns',
    ],
  },
  hazardous: {
    headlineKey: 'advisory.hazardous.headline',
    adviceKey: 'advisory.hazardous.advice',
    schoolOutdoorPermitted: false,
    actions: [
      'advisory.action.emergency_curfew',
      'advisory.action.complete_construction_ban',
      'advisory.action.mandatory_work_from_home',
      'advisory.action.emergency_smog_guns',
      'advisory.action.open_air_filtration_halls',
    ],
  },
} as const;

/**
 * Generates an institutional community air quality advisory for RWAs, schools, and civic groups.
 */
export function buildAdvisory(input: AdvisoryInput): CommunityAdvisory {
  const config = BAND_ADVISORY_KEYS[input.dominantCategory];

  return {
    city: input.city,
    aqi: input.aqi,
    band: input.dominantCategory,
    schoolOutdoorPermitted: config.schoolOutdoorPermitted,
    communityActions: config.actions,
    headlineKey: config.headlineKey,
    adviceKey: config.adviceKey,
  };
}
