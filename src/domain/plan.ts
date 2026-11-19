import type { Clock } from './ports';
import { listActions } from './actions';
import { computeExposure } from './exposure';
import { bestWindows } from './schedule';
import type { DayPlan, PlanInput, RankedAction, Scenario } from './types';

/**
 * Evaluates and ranks applicable mitigation actions by dosage reduction efficiency per effort unit.
 */
export function rankActions(input: PlanInput): RankedAction[] {
  const actions = listActions(input.profile);
  const baseline = computeExposure({
    hourly: input.hourly,
    profile: input.profile,
    scenario: input.baselineScenario,
  });

  const ranked: RankedAction[] = [];

  for (const action of actions) {
    if (action.isQualitative) {
      ranked.push({
        action,
        deltaDoseUg: 0,
        deltaPercent: 0,
        deltaCigaretteEq: 0,
      });
      continue;
    }

    const modifiedScenario = action.apply(input.baselineScenario);
    const modifiedExposure = computeExposure({
      hourly: input.hourly,
      profile: input.profile,
      scenario: modifiedScenario,
    });

    const deltaDoseUg = Math.max(0, baseline.dailyDoseUg - modifiedExposure.dailyDoseUg);
    const deltaPercent =
      baseline.dailyDoseUg > 0 ? Math.round((deltaDoseUg / baseline.dailyDoseUg) * 100) : 0;
    const deltaCigaretteEq =
      Math.round(
        Math.max(0, baseline.cigaretteEquivalent - modifiedExposure.cigaretteEquivalent) * 10,
      ) / 10;

    ranked.push({
      action,
      deltaDoseUg,
      deltaPercent,
      deltaCigaretteEq,
    });
  }

  ranked.sort((a, b) => {
    const scoreA = a.deltaDoseUg / a.action.effort;
    const scoreB = b.deltaDoseUg / b.action.effort;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    if (a.action.effort !== b.action.effort) {
      return a.action.effort - b.action.effort;
    }
    return a.action.id.localeCompare(b.action.id);
  });

  return ranked;
}

/**
 * Builds an optimized 24-hour daily air quality action plan with exposure projections.
 */
export function buildDayPlan(input: PlanInput, clock: Clock): DayPlan {
  const baselineExposure = computeExposure({
    hourly: input.hourly,
    profile: input.profile,
    scenario: input.baselineScenario,
  });

  const rankedActions = rankActions(input);

  // Apply top non-conflicting quantitative actions to build optimized scenario
  let currentScenario: Scenario = input.baselineScenario;
  const topEffectiveActions = rankedActions.filter((r) => r.deltaDoseUg > 0).slice(0, 4);

  for (const item of topEffectiveActions) {
    currentScenario = item.action.apply(currentScenario);
  }

  const optimizedExposure = computeExposure({
    hourly: input.hourly,
    profile: input.profile,
    scenario: currentScenario,
  });

  const optimalWindows = bestWindows(input.hourly, 'exercise', 2);

  return {
    baselineExposure,
    rankedActions,
    optimizedScenario: currentScenario,
    optimizedExposure,
    bestWindows: optimalWindows,
    generatedAt: clock.iso(),
  };
}
