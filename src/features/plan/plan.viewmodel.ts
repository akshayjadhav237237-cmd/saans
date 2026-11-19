import type {
  DayPlan,
  ExposureResult,
  HouseholdMember,
  HouseholdProfile,
  MemberExposure,
  RankedAction,
  TimeWindow,
} from '../../domain/types';
import { translate, type Language, type TranslationKey } from '../../i18n';
import { formatCategoryLabel, formatRiskBandLabel } from './plan.format';
import type {
  ActionCategoryGroupViewModel,
  ActionItemViewModel,
  BestWindowViewModel,
  ExposureComparisonViewModel,
  MemberExposureViewModel,
  PlanViewModel,
} from './plan.types';

export { formatCategoryLabel, formatRiskBandLabel, mapRiskToAqiBand } from './plan.format';

/** Formats baseline versus optimized exposure totals into display models. */
export function buildComparisonViewModel(
  baseline: ExposureResult,
  optimized: ExposureResult,
  lang: Language,
): ExposureComparisonViewModel {
  const deltaDoseUg = Math.max(0, baseline.dailyDoseUg - optimized.dailyDoseUg);
  const deltaPercent =
    baseline.dailyDoseUg > 0 ? Math.round((deltaDoseUg / baseline.dailyDoseUg) * 100) : 0;
  const doseUnit = translate(lang, 'plan.dose.unit');
  const cigUnit = translate(lang, 'plan.cig.per_day');

  return {
    baseline: {
      doseUg: baseline.dailyDoseUg,
      doseFormatted: `${baseline.dailyDoseUg} ${doseUnit}`,
      cigEq: baseline.cigaretteEquivalent,
      cigFormatted: `${baseline.cigaretteEquivalent} ${cigUnit}`,
      avgBreathedPm25: baseline.averageBreathedPm25,
    },
    optimized: {
      doseUg: optimized.dailyDoseUg,
      doseFormatted: `${optimized.dailyDoseUg} ${doseUnit}`,
      cigEq: optimized.cigaretteEquivalent,
      cigFormatted: `${optimized.cigaretteEquivalent} ${cigUnit}`,
      avgBreathedPm25: optimized.averageBreathedPm25,
    },
    deltaDoseUg,
    deltaPercent,
    disclaimer: translate(lang, 'plan.cig.hint'),
  };
}

function buildSingleMember(
  member: HouseholdMember,
  base: MemberExposure | undefined,
  opt: MemberExposure | undefined,
  lang: Language,
): MemberExposureViewModel {
  const baseRisk = base ? base.riskBand : 'moderate';
  const optRisk = opt ? opt.riskBand : 'low';
  const roleKey = `household.member.role.${member.role}` as TranslationKey;

  return {
    memberId: member.id,
    role: member.role,
    roleLabel: translate(lang, roleKey),
    hasCondition: member.hasRespiratoryCondition,
    baselineDoseUg: base ? base.dailyDoseUg : 0,
    optimizedDoseUg: opt ? opt.dailyDoseUg : 0,
    baselineRiskBand: baseRisk,
    baselineRiskBandLabel: formatRiskBandLabel(baseRisk, lang),
    optimizedRiskBand: optRisk,
    optimizedRiskBandLabel: formatRiskBandLabel(optRisk, lang),
    baselineCigEq: base ? base.cigaretteEquivalent : 0,
    optimizedCigEq: opt ? opt.cigaretteEquivalent : 0,
  };
}

/** Maps individual household member exposures and risk tiers for baseline and plan. */
export function buildMemberViewModels(
  plan: DayPlan,
  profile: HouseholdProfile,
  lang: Language,
): readonly MemberExposureViewModel[] {
  const baseMap = new Map(plan.baselineExposure.memberExposures.map((m) => [m.memberId, m]));
  const optMap = new Map(plan.optimizedExposure.memberExposures.map((m) => [m.memberId, m]));
  return profile.members.map((member) =>
    buildSingleMember(member, baseMap.get(member.id), optMap.get(member.id), lang),
  );
}

/** Groups ranked actions by category with localized titles, impact, and effort badges. */
export function buildActionGroupViewModels(
  rankedActions: readonly RankedAction[],
  lang: Language,
): readonly ActionCategoryGroupViewModel[] {
  const categories = ['routine', 'indoor', 'sustainable', 'community'] as const;

  return categories
    .map((category) => {
      const inCategory = rankedActions.filter((r) => r.action.category === category);
      const actions: ActionItemViewModel[] = inCategory.map((ra) => {
        const isQual = Boolean(ra.action.isQualitative);
        const impactLabel = isQual
          ? translate(lang, 'plan.action.impact_indirect')
          : translate(lang, 'plan.action.impact', { delta: ra.deltaPercent });
        const whyKey = (ra.action.reasonKey ?? ra.action.descriptionKey) as TranslationKey;

        return {
          id: ra.action.id,
          category: ra.action.category,
          title: translate(lang, ra.action.titleKey as TranslationKey),
          description: translate(lang, ra.action.descriptionKey as TranslationKey),
          effort: ra.action.effort,
          effortLabel: translate(lang, 'plan.action.effort', { effort: ra.action.effort }),
          costBand: ra.action.costBand,
          costLabel: translate(lang, 'plan.action.cost', { cost: ra.action.costBand }),
          isQualitative: isQual,
          deltaDoseUg: ra.deltaDoseUg,
          deltaPercent: ra.deltaPercent,
          impactLabel,
          whyReason: translate(lang, whyKey),
        };
      });

      return {
        category,
        categoryLabel: formatCategoryLabel(category, lang),
        actions,
      };
    })
    .filter((group) => group.actions.length > 0);
}

/** Formats lowest-exposure activity windows with localized hour ranges and averages. */
export function buildBestWindowViewModels(
  windows: readonly TimeWindow[],
  lang: Language,
): readonly BestWindowViewModel[] {
  return windows.map((w) => ({
    startHour: w.startHour,
    endHour: w.endHour,
    timeRangeFormatted: translate(lang, 'plan.windows.hours', {
      start: w.startHour,
      end: w.endHour,
    }),
    averagePm25: w.averagePm25,
    avgFormatted: translate(lang, 'plan.windows.avg', { avg: w.averagePm25 }),
    label: translate(lang, w.labelKey as TranslationKey),
  }));
}

/** Pure mapping function translating a DayPlan and profile into the viewmodel structure. */
export function buildPlanViewModel(
  plan: DayPlan,
  profile: HouseholdProfile,
  lang: Language,
): PlanViewModel {
  return {
    comparison: buildComparisonViewModel(plan.baselineExposure, plan.optimizedExposure, lang),
    members: buildMemberViewModels(plan, profile, lang),
    actionGroups: buildActionGroupViewModels(plan.rankedActions, lang),
    bestWindows: buildBestWindowViewModels(plan.bestWindows, lang),
  };
}
