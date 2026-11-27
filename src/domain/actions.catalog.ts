import type { ActionCategory, ActionDef, HouseholdProfile, Scenario, ScenarioHour } from './types';

function modifyHours(scenario: Scenario, updater: (h: ScenarioHour) => ScenarioHour): Scenario {
  return { hours: scenario.hours.map(updater) };
}

const hasChild = (p: HouseholdProfile): boolean => p.members.some((m) => m.role === 'child');
const always = (): boolean => true;
const noPurifierOwned = (p: HouseholdProfile): boolean => !p.hasAirPurifier;
const usesTwoWheeler = (p: HouseholdProfile): boolean =>
  (p.commuteMode ?? 'commute_two_wheeler') === 'commute_two_wheeler';

interface QualActionConfig {
  readonly id: string;
  readonly category: ActionCategory;
  readonly effort: 1 | 2 | 3;
  readonly costBand: 0 | 1 | 2 | 3;
  readonly appliesTo?: (p: HouseholdProfile) => boolean;
}

function createQual(cfg: QualActionConfig): ActionDef {
  return {
    id: cfg.id,
    category: cfg.category,
    effort: cfg.effort,
    costBand: cfg.costBand,
    titleKey: `action.${cfg.id}.title`,
    descriptionKey: `action.${cfg.id}.desc`,
    isQualitative: true,
    reasonKey: `action.${cfg.id}.reason`,
    appliesTo: cfg.appliesTo ?? always,
    apply: (s) => s,
  };
}

export const ACTIONS_CATALOG: readonly ActionDef[] = [
  {
    id: 'shift_outdoor_play',
    category: 'routine',
    effort: 1,
    costBand: 0,
    titleKey: 'action.shift_outdoor_play.title',
    descriptionKey: 'action.shift_outdoor_play.desc',
    appliesTo: hasChild,
    apply: (s) =>
      modifyHours(s, (h) =>
        h.hour === 17 && h.environment === 'outdoor' ? { ...h, environment: 'indoor_home' } : h,
      ),
  },
  {
    id: 'indoor_exercise',
    category: 'routine',
    effort: 1,
    costBand: 0,
    titleKey: 'action.indoor_exercise.title',
    descriptionKey: 'action.indoor_exercise.desc',
    appliesTo: always,
    apply: (s) =>
      modifyHours(s, (h) =>
        (h.hour === 6 || h.hour === 7) && h.environment === 'outdoor'
          ? { ...h, environment: 'indoor_home' }
          : h,
      ),
  },
  {
    id: 'commute_n95_mask',
    category: 'routine',
    effort: 1,
    costBand: 1,
    titleKey: 'action.commute_n95_mask.title',
    descriptionKey: 'action.commute_n95_mask.desc',
    appliesTo: always,
    apply: (s) =>
      modifyHours(s, (h) =>
        h.environment.startsWith('commute_') || h.environment === 'outdoor'
          ? { ...h, mask: 'n95' }
          : h,
      ),
  },
  {
    id: 'school_run_timing',
    category: 'routine',
    effort: 2,
    costBand: 0,
    titleKey: 'action.school_run_timing.title',
    descriptionKey: 'action.school_run_timing.desc',
    appliesTo: hasChild,
    apply: (s) =>
      modifyHours(s, (h) =>
        h.hour === 8 && h.environment === 'commute_two_wheeler'
          ? { ...h, environment: 'commute_car', mask: 'n95' }
          : h,
      ),
  },
  {
    id: 'seal_door_gaps',
    category: 'indoor',
    effort: 2,
    costBand: 1,
    titleKey: 'action.seal_door_gaps.title',
    descriptionKey: 'action.seal_door_gaps.desc',
    appliesTo: always,
    apply: (s) => modifyHours(s, (h) => ({ ...h, windowsSealed: true })),
  },
  {
    id: 'purifier_bedroom',
    category: 'indoor',
    effort: 1,
    costBand: 2,
    titleKey: 'action.purifier_bedroom.title',
    descriptionKey: 'action.purifier_bedroom.desc',
    appliesTo: noPurifierOwned,
    apply: (s) =>
      modifyHours(s, (h) => (h.environment === 'indoor_home' ? { ...h, purifier: 'on_room' } : h)),
  },
  {
    id: 'damp_mop_not_dry_sweep',
    category: 'indoor',
    effort: 1,
    costBand: 0,
    titleKey: 'action.damp_mop_not_dry_sweep.title',
    descriptionKey: 'action.damp_mop_not_dry_sweep.desc',
    appliesTo: always,
    apply: (s) => modifyHours(s, (h) => ({ ...h, dampMopping: true })),
  },
  {
    id: 'cook_with_ventilation',
    category: 'indoor',
    effort: 1,
    costBand: 0,
    titleKey: 'action.cook_with_ventilation.title',
    descriptionKey: 'action.cook_with_ventilation.desc',
    appliesTo: always,
    apply: (s) => modifyHours(s, (h) => ({ ...h, cookingVentilated: true })),
  },
  {
    id: 'no_incense_or_coils',
    category: 'indoor',
    effort: 1,
    costBand: 0,
    titleKey: 'action.no_incense_or_coils.title',
    descriptionKey: 'action.no_incense_or_coils.desc',
    appliesTo: always,
    apply: (s) => modifyHours(s, (h) => ({ ...h, biomassBurning: false })),
  },
  {
    id: 'diy_corsi_rosenthal_box',
    category: 'indoor',
    effort: 3,
    costBand: 1,
    titleKey: 'action.diy_corsi_rosenthal_box.title',
    descriptionKey: 'action.diy_corsi_rosenthal_box.desc',
    appliesTo: always,
    apply: (s) =>
      modifyHours(s, (h) =>
        h.environment === 'indoor_home' ? { ...h, purifier: 'on_whole_house' } : h,
      ),
  },
  {
    id: 'metro_bus_commute',
    category: 'sustainable',
    effort: 2,
    costBand: 1,
    titleKey: 'action.metro_bus_commute.title',
    descriptionKey: 'action.metro_bus_commute.desc',
    appliesTo: usesTwoWheeler,
    apply: (s) =>
      modifyHours(s, (h) =>
        h.environment === 'commute_two_wheeler' ? { ...h, environment: 'commute_public' } : h,
      ),
  },
  createQual({ id: 'carpool_shared_cab', category: 'sustainable', effort: 1, costBand: 1 }),
  createQual({ id: 'clean_cooking_fuel', category: 'sustainable', effort: 2, costBand: 2 }),
  createQual({ id: 'zero_waste_burning', category: 'sustainable', effort: 1, costBand: 0 }),
  createQual({ id: 'skip_firecrackers', category: 'sustainable', effort: 1, costBand: 0 }),
  createQual({ id: 'vehicle_engine_idle_off', category: 'sustainable', effort: 1, costBand: 0 }),
  createQual({ id: 'rwa_dust_control', category: 'community', effort: 2, costBand: 1 }),
  createQual({
    id: 'school_outdoor_threshold',
    category: 'community',
    effort: 2,
    costBand: 0,
    appliesTo: hasChild,
  }),
  createQual({ id: 'shared_rwa_purifier_room', category: 'community', effort: 3, costBand: 2 }),
];
