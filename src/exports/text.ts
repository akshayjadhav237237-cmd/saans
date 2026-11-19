import type { DayPlan, HouseholdProfile, RankedAction, TimeWindow } from '../domain/types';
import type { Language, TranslationKey } from '../i18n';
import { translate } from '../i18n';
import type { GeneratedExport, TextPlanOptions } from './types';

function formatHeader(lang: Language, cityName?: string): string[] {
  const title = translate(lang, 'app.title');
  const subtitle = translate(lang, 'app.subtitle');
  const lines: string[] = [
    '============================================================',
    `${title.toUpperCase()} - ${subtitle}`,
    '============================================================',
  ];
  if (cityName && cityName.trim().length > 0) {
    const locLabel = translate(lang, 'location.title');
    lines.push(`${locLabel}: ${cityName}`);
  }
  return lines;
}

function formatHousehold(lang: Language, profile?: HouseholdProfile): string[] {
  if (!profile) return [];
  const lines: string[] = ['', `--- ${translate(lang, 'household.title')} ---`];
  lines.push(`${translate(lang, 'household.name.label')}: ${profile.name}`);
  const counts = { child: 0, adult: 0, elder: 0 };
  let respCount = 0;
  for (const m of profile.members) {
    counts[m.role] += 1;
    if (m.hasRespiratoryCondition) respCount += 1;
  }
  const parts: string[] = [];
  if (counts.child > 0)
    parts.push(`${translate(lang, 'household.member.role.child')}: ${counts.child}`);
  if (counts.adult > 0)
    parts.push(`${translate(lang, 'household.member.role.adult')}: ${counts.adult}`);
  if (counts.elder > 0)
    parts.push(`${translate(lang, 'household.member.role.elder')}: ${counts.elder}`);
  lines.push(`${translate(lang, 'household.members.title')}: ${parts.join(', ')}`);
  if (respCount > 0) {
    lines.push(`${translate(lang, 'household.member.respiratory')}: ${respCount}`);
  }
  return lines;
}

function formatBudget(lang: Language, plan: DayPlan): string[] {
  const baseDose = plan.baselineExposure.dailyDoseUg;
  const optDose = plan.optimizedExposure.dailyDoseUg;
  const deltaDose = Math.max(0, baseDose - optDose);
  const deltaPct = baseDose > 0 ? Math.round((deltaDose / baseDose) * 100) : 0;
  return [
    '',
    `--- ${translate(lang, 'plan.title')} ---`,
    `${translate(lang, 'plan.baseline.title')}:`,
    `  ${translate(lang, 'plan.dose.label')}: ${baseDose} ${translate(lang, 'plan.dose.unit')}`,
    `  ${translate(lang, 'plan.cig.label')}: ${plan.baselineExposure.cigaretteEquivalent} ${translate(lang, 'plan.cig.per_day')}`,
    `${translate(lang, 'plan.optimized.title')}:`,
    `  ${translate(lang, 'plan.dose.label')}: ${optDose} ${translate(lang, 'plan.dose.unit')}`,
    `  ${translate(lang, 'plan.cig.label')}: ${plan.optimizedExposure.cigaretteEquivalent} ${translate(lang, 'plan.cig.per_day')}`,
    `Impact: ~${deltaPct}% reduction (${deltaDose} ug/day saved)`,
  ];
}

function formatWindows(lang: Language, windows: readonly TimeWindow[]): string[] {
  if (windows.length === 0) return [];
  const lines: string[] = ['', `--- ${translate(lang, 'plan.windows.title')} ---`];
  for (const w of windows) {
    const label = translate(lang, w.labelKey as TranslationKey);
    lines.push(
      `* ${w.startHour}:00 - ${w.endHour}:00 | Avg PM2.5: ${w.averagePm25} ug/m3 | ${label}`,
    );
  }
  return lines;
}

function formatActions(lang: Language, actions: readonly RankedAction[]): string[] {
  if (actions.length === 0) return [];
  const lines: string[] = ['', `--- ${translate(lang, 'plan.actions.title')} ---`];
  for (const item of actions.slice(0, 5)) {
    const title = translate(lang, item.action.titleKey as TranslationKey);
    const impact =
      item.deltaDoseUg > 0 ? `-${item.deltaPercent}% (${item.deltaDoseUg} ug)` : 'Qualitative';
    lines.push(`* ${title} [${impact}]`);
    const desc = translate(lang, item.action.descriptionKey as TranslationKey);
    lines.push(`  ${desc}`);
  }
  return lines;
}

function formatFooter(lang: Language): string[] {
  return [
    '',
    '------------------------------------------------------------',
    translate(lang, 'app.footer.attribution'),
    translate(lang, 'plan.cig.hint'),
    '------------------------------------------------------------',
  ];
}

/** Formats a personalized exposure day plan into a formatted plain-text document. */
export function formatTextPlan(options: TextPlanOptions): string {
  const lines: string[] = [
    ...formatHeader(options.language, options.cityName),
    ...formatHousehold(options.language, options.profile),
    ...formatBudget(options.language, options.plan),
    ...formatWindows(options.language, options.plan.bestWindows),
    ...formatActions(options.language, options.plan.rankedActions),
    ...formatFooter(options.language),
  ];
  return lines.join('\n');
}

/** Generates a plain-text file export container containing the complete daily plan. */
export function generateTextPlan(options: TextPlanOptions): GeneratedExport {
  const dateStr = options.plan.generatedAt ? options.plan.generatedAt.slice(0, 10) : 'plan';
  return {
    filename: `saans-plan-${dateStr}.txt`,
    content: formatTextPlan(options),
    mimeType: 'text/plain;charset=utf-8',
  };
}
