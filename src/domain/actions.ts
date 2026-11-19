import { ACTIONS_CATALOG } from './actions.catalog';
import type { ActionDef, ActionId, HouseholdProfile, Scenario } from './types';

/**
 * Lists applicable mitigation action definitions tailored to a household profile.
 */
export function listActions(profile: HouseholdProfile): ActionDef[] {
  return ACTIONS_CATALOG.filter((action) => action.appliesTo(profile));
}

/**
 * Applies a specific mitigation action to modify a daily lifestyle scenario.
 */
export function applyAction(scenario: Scenario, actionId: ActionId): Scenario {
  const action = ACTIONS_CATALOG.find((a) => a.id === actionId);
  if (!action) {
    return scenario;
  }
  return action.apply(scenario);
}
