import { describe, expect, it } from 'vitest';
import * as domain from '../src/domain/index';

describe('Domain Index Module Exports', () => {
  it('exports all domain functions and catalog definitions', () => {
    expect(domain.classifyAqi).toBeTypeOf('function');
    expect(domain.computeExposure).toBeTypeOf('function');
    expect(domain.applyAction).toBeTypeOf('function');
    expect(domain.listActions).toBeTypeOf('function');
    expect(domain.rankActions).toBeTypeOf('function');
    expect(domain.bestWindows).toBeTypeOf('function');
    expect(domain.buildDayPlan).toBeTypeOf('function');
    expect(domain.buildAdvisory).toBeTypeOf('function');
    expect(domain.roundInteger).toBeTypeOf('function');
    expect(domain.roundOneDecimal).toBeTypeOf('function');
    expect(domain.validateHouseholdProfile).toBeTypeOf('function');
    expect(domain.hasVulnerableMembers).toBeTypeOf('function');
    expect(domain.getMemberSensitivityWeight).toBeTypeOf('function');
    expect(domain.evaluateRiskBand).toBeTypeOf('function');
    expect(domain.MAX_HOUSEHOLD_MEMBERS).toBe(6);
    expect(domain.ACTIONS_CATALOG).toBeDefined();
    expect(domain.ACTIONS_CATALOG.length).toBeGreaterThan(0);
  });
});
