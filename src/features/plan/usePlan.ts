import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AirQualityData } from '../../data/types';
import { buildBaselineScenario, buildDayPlan } from '../../domain/plan';
import { createSystemClock, type Clock } from '../../domain/ports';
import type { DayPlan, HouseholdProfile, Scenario } from '../../domain/types';
import { useAppStore } from '../../state/store';
import type { PlanViewModel } from './plan.types';
import { buildPlanViewModel } from './plan.viewmodel';

export interface UsePlanReturn {
  readonly plan: DayPlan | null;
  readonly viewModel: PlanViewModel | null;
  readonly hasData: boolean;
  readonly isLoading: boolean;
  readonly expandedActionIds: ReadonlySet<string>;
  readonly toggleActionExpanded: (actionId: string) => void;
  readonly isActionExpanded: (actionId: string) => boolean;
}

/** Generates a default 24-hour diurnal routine baseline scenario for exposure calculation. */
export function createDefaultBaselineScenario(): Scenario {
  return buildBaselineScenario({
    id: 'h_default',
    name: 'Our Family',
    city: 'Delhi',
    members: [],
    commuteMode: 'commute_two_wheeler',
    hasAirPurifier: false,
  });
}

function computeDayPlan(
  hasData: boolean,
  airData: AirQualityData | null,
  profile: HouseholdProfile,
  clock: Clock,
): DayPlan | null {
  if (!hasData || !airData) return null;
  return buildDayPlan(
    { hourly: airData.hourly, profile, baselineScenario: buildBaselineScenario(profile) },
    clock,
  );
}

const DEFAULT_CLOCK: Clock = createSystemClock();

/** React hook computing the deterministic day plan, syncing to store, and managing expansion states. */
export function usePlan(clock: Clock = DEFAULT_CLOCK): UsePlanReturn {
  const airData = useAppStore((s) => s.airData);
  const profile = useAppStore((s) => s.profile);
  const language = useAppStore((s) => s.language);
  const plan = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const isLoading = useAppStore((s) => s.isAirLoading);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

  const hasData = Boolean(
    airData && airData.hourly.length > 0 && profile.city && profile.members.length > 0,
  );
  const computedPlan = useMemo(
    () => computeDayPlan(hasData, airData, profile, clock),
    [hasData, airData, profile, clock],
  );

  useEffect(() => {
    setPlan(computedPlan);
  }, [computedPlan, setPlan]);

  const activePlan = computedPlan ?? plan;
  const viewModel = useMemo(
    () => (activePlan ? buildPlanViewModel(activePlan, profile, language) : null),
    [activePlan, profile, language],
  );

  const toggleActionExpanded = useCallback((actionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) next.delete(actionId);
      else next.add(actionId);
      return next;
    });
  }, []);

  return {
    plan: activePlan,
    viewModel,
    hasData,
    isLoading,
    expandedActionIds: expandedIds,
    toggleActionExpanded,
    isActionExpanded: useCallback((id: string) => expandedIds.has(id), [expandedIds]),
  };
}
