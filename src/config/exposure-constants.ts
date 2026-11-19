import type { MaskType, MicroEnvironment, MemberRole, PurifierState } from '../domain/types';

export interface ParameterWithSource<T> {
  readonly value: T;
  readonly source: 'heuristic' | string;
  readonly description: string;
}

/**
 * Average respiratory inhalation rates by member demographic role in m^3 per hour.
 * Source: US EPA Exposure Factors Handbook (Chapter 6).
 */
export const BREATHING_RATES_M3_PER_HOUR: Record<MemberRole, ParameterWithSource<number>> = {
  child: {
    value: 0.4,
    source: 'https://www.epa.gov/expobox/exposure-factors-handbook-chapter-6',
    description: 'Average inhalation rate for active school-age children (0.4 m3/h).',
  },
  adult: {
    value: 0.6,
    source: 'https://www.epa.gov/expobox/exposure-factors-handbook-chapter-6',
    description: 'Average inhalation rate for adults during mixed light activity (0.6 m3/h).',
  },
  elder: {
    value: 0.5,
    source: 'https://www.epa.gov/expobox/exposure-factors-handbook-chapter-6',
    description: 'Average inhalation rate for older adults (0.5 m3/h).',
  },
};

/**
 * Micro-environment ambient PM2.5 infiltration and exposure ratios.
 */
export const ENVIRONMENT_FACTORS: Record<MicroEnvironment, ParameterWithSource<number>> = {
  outdoor: {
    value: 1.0,
    source: 'heuristic',
    description: 'Direct ambient outdoor exposure reference baseline.',
  },
  commute_walk: {
    value: 1.1,
    source: 'heuristic',
    description: 'Roadside proximity pedestrian travel exposure elevation.',
  },
  commute_two_wheeler: {
    value: 1.25,
    source: 'heuristic',
    description: 'High exhaust exposure in congested urban vehicular corridors.',
  },
  commute_car: {
    value: 0.7,
    source: 'heuristic',
    description: 'Enclosed vehicular cabin with recirculating ventilation.',
  },
  commute_public: {
    value: 0.8,
    source: 'heuristic',
    description: 'Transit metro or bus cabin intermediate infiltration.',
  },
  indoor_home: {
    value: 0.6,
    source: 'https://www.epa.gov/indoor-air-quality-iaq',
    description: 'Typical residential unsealed indoor-to-outdoor PM2.5 ratio (0.60).',
  },
  indoor_work_school: {
    value: 0.55,
    source: 'heuristic',
    description: 'Commercial facility with baseline central air filtration.',
  },
};

/**
 * Real-world fit-adjusted mask filtration efficiencies.
 */
export const MASK_FILTRATION: Record<MaskType, ParameterWithSource<number>> = {
  none: {
    value: 0.0,
    source: 'heuristic',
    description: 'No respiratory protection.',
  },
  cloth: {
    value: 0.2,
    source: 'heuristic',
    description: 'Standard cloth face covering with moderate edge leakage.',
  },
  surgical: {
    value: 0.4,
    source: 'heuristic',
    description: 'Three-ply surgical mask with standard side leakage.',
  },
  n95: {
    value: 0.9,
    source: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html',
    description: 'Tight-fitting particulate respirator achieving ~90% real-world fit efficiency.',
  },
};

/**
 * Operational air purifier PM2.5 reduction percentages.
 */
export const PURIFIER_REDUCTION: Record<PurifierState, ParameterWithSource<number>> = {
  off: {
    value: 0.0,
    source: 'heuristic',
    description: 'Purifier turned off.',
  },
  on_room: {
    value: 0.5,
    source: 'https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home',
    description: 'Single-room HEPA air cleaner delivering ~50% concentration reduction.',
  },
  on_whole_house: {
    value: 0.7,
    source: 'https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home',
    description: 'Multi-room or central air filtration achieving ~70% reduction.',
  },
};

/**
 * Additional indoor emission modifiers in ug/m3.
 */
export const INDOOR_MODIFIERS = {
  sealedWindowsFactorReduction: 0.15,
  unventilatedCookingAdditionUg: 40,
  drySweepingAdditionUg: 20,
  burningIncenseAdditionUg: 60,
} as const;

/**
 * Berkeley Earth cigarette equivalence divisor.
 * Note: rough heuristic, not medical.
 * Source: https://berkeleyearth.org/air-pollution-and-cigarette-equivalence/
 */
export const CIGARETTE_EQUIVALENT_PM25_DIVISOR = 22;
