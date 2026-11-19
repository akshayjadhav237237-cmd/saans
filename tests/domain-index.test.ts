import { describe, expect, it } from 'vitest';
import { applyAction, listActions } from '../src/domain/actions';
import { ACTIONS_CATALOG } from '../src/domain/actions.catalog';
import { buildAdvisory } from '../src/domain/advisory';
import { classifyAqi } from '../src/domain/aqi';
import { computeExposure, evaluateRiskBand } from '../src/domain/exposure';
import { roundInteger, roundOneDecimal } from '../src/domain/format';
import {
  getMemberSensitivityWeight,
  hasVulnerableMembers,
  MAX_HOUSEHOLD_MEMBERS,
  validateHouseholdProfile,
} from '../src/domain/household';
import { buildDayPlan, rankActions } from '../src/domain/plan';
import { bestWindows } from '../src/domain/schedule';

describe('Domain Module Direct Exports', () => {
  it('exports all domain functions and catalog definitions', () => {
    expect(classifyAqi).toBeTypeOf('function');
    expect(computeExposure).toBeTypeOf('function');
    expect(applyAction).toBeTypeOf('function');
    expect(listActions).toBeTypeOf('function');
    expect(rankActions).toBeTypeOf('function');
    expect(bestWindows).toBeTypeOf('function');
    expect(buildDayPlan).toBeTypeOf('function');
    expect(buildAdvisory).toBeTypeOf('function');
    expect(roundInteger).toBeTypeOf('function');
    expect(roundOneDecimal).toBeTypeOf('function');
    expect(validateHouseholdProfile).toBeTypeOf('function');
    expect(hasVulnerableMembers).toBeTypeOf('function');
    expect(getMemberSensitivityWeight).toBeTypeOf('function');
    expect(evaluateRiskBand).toBeTypeOf('function');
    expect(MAX_HOUSEHOLD_MEMBERS).toBe(6);
    expect(ACTIONS_CATALOG).toBeDefined();
    expect(ACTIONS_CATALOG.length).toBeGreaterThan(0);
  });
});
