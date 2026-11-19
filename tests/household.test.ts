import { describe, expect, it } from 'vitest';
import {
  getMemberSensitivityWeight,
  hasVulnerableMembers,
  MAX_HOUSEHOLD_MEMBERS,
  validateHouseholdProfile,
} from '../src/domain/household';
import type { HouseholdMember, HouseholdProfile } from '../src/domain/types';

describe('Household Engine', () => {
  const baseProfile: HouseholdProfile = {
    id: 'h-100',
    name: 'Sharma Family',
    city: 'Delhi',
    members: [
      { id: 'm-1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm-2', role: 'child', hasRespiratoryCondition: false },
    ],
  };

  it('validates a correct household profile', () => {
    const result = validateHouseholdProfile(baseProfile);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Sharma Family');
      expect(result.value.members.length).toBe(2);
    }
  });

  it('rejects profiles with missing or whitespace-only name', () => {
    const missingName = { ...baseProfile, name: '' };
    expect(validateHouseholdProfile(missingName)).toEqual({
      ok: false,
      error: 'profile.error.name_required',
    });

    const whitespaceName = { ...baseProfile, name: '   ' };
    expect(validateHouseholdProfile(whitespaceName)).toEqual({
      ok: false,
      error: 'profile.error.name_required',
    });
  });

  it('rejects profiles with missing or whitespace-only city', () => {
    const missingCity = { ...baseProfile, city: '' };
    expect(validateHouseholdProfile(missingCity)).toEqual({
      ok: false,
      error: 'profile.error.city_required',
    });

    const whitespaceCity = { ...baseProfile, city: '  \t  ' };
    expect(validateHouseholdProfile(whitespaceCity)).toEqual({
      ok: false,
      error: 'profile.error.city_required',
    });
  });

  it('rejects profiles with zero members', () => {
    const emptyMembers = { ...baseProfile, members: [] };
    expect(validateHouseholdProfile(emptyMembers)).toEqual({
      ok: false,
      error: 'profile.error.members_required',
    });
  });

  it('accepts profiles with exactly MAX_HOUSEHOLD_MEMBERS members', () => {
    const maxMembers = Array.from({ length: MAX_HOUSEHOLD_MEMBERS }, (_, i) => ({
      id: `m-${i}`,
      role: 'adult' as const,
      hasRespiratoryCondition: false,
    }));
    const profile = { ...baseProfile, members: maxMembers };
    expect(validateHouseholdProfile(profile).ok).toBe(true);
  });

  it('rejects profiles exceeding MAX_HOUSEHOLD_MEMBERS limit', () => {
    const tooMany = Array.from({ length: MAX_HOUSEHOLD_MEMBERS + 1 }, (_, i) => ({
      id: `m-${i}`,
      role: 'adult' as const,
      hasRespiratoryCondition: false,
    }));
    const profile = { ...baseProfile, members: tooMany };
    expect(validateHouseholdProfile(profile)).toEqual({
      ok: false,
      error: 'profile.error.max_members_exceeded',
    });
  });

  it('rejects profiles with invalid or empty member ids', () => {
    const invalidMember = {
      ...baseProfile,
      members: [{ id: '   ', role: 'adult' as const, hasRespiratoryCondition: false }],
    };
    expect(validateHouseholdProfile(invalidMember)).toEqual({
      ok: false,
      error: 'profile.error.member_id_required',
    });
  });

  it('detects vulnerable members correctly based on role and conditions', () => {
    const adultOnly: HouseholdProfile = {
      ...baseProfile,
      members: [{ id: 'm-1', role: 'adult', hasRespiratoryCondition: false }],
    };
    expect(hasVulnerableMembers(adultOnly)).toBe(false);

    const withChild: HouseholdProfile = {
      ...baseProfile,
      members: [{ id: 'm-1', role: 'child', hasRespiratoryCondition: false }],
    };
    expect(hasVulnerableMembers(withChild)).toBe(true);

    const withElder: HouseholdProfile = {
      ...baseProfile,
      members: [{ id: 'm-1', role: 'elder', hasRespiratoryCondition: false }],
    };
    expect(hasVulnerableMembers(withElder)).toBe(true);

    const withAsthmaticAdult: HouseholdProfile = {
      ...baseProfile,
      members: [{ id: 'm-1', role: 'adult', hasRespiratoryCondition: true }],
    };
    expect(hasVulnerableMembers(withAsthmaticAdult)).toBe(true);
  });

  it('calculates sensitivity weights accurately for all demographics', () => {
    const healthyAdult: HouseholdMember = {
      id: '1',
      role: 'adult',
      hasRespiratoryCondition: false,
    };
    const sickAdult: HouseholdMember = {
      id: '2',
      role: 'adult',
      hasRespiratoryCondition: true,
    };
    const healthyChild: HouseholdMember = {
      id: '3',
      role: 'child',
      hasRespiratoryCondition: false,
    };
    const sickChild: HouseholdMember = {
      id: '4',
      role: 'child',
      hasRespiratoryCondition: true,
    };
    const healthyElder: HouseholdMember = {
      id: '5',
      role: 'elder',
      hasRespiratoryCondition: false,
    };
    const sickElder: HouseholdMember = {
      id: '6',
      role: 'elder',
      hasRespiratoryCondition: true,
    };

    expect(getMemberSensitivityWeight(healthyAdult)).toBe(1.0);
    expect(getMemberSensitivityWeight(sickAdult)).toBeCloseTo(1.4);
    expect(getMemberSensitivityWeight(healthyChild)).toBeCloseTo(1.3);
    expect(getMemberSensitivityWeight(sickChild)).toBeCloseTo(1.7);
    expect(getMemberSensitivityWeight(healthyElder)).toBeCloseTo(1.3);
    expect(getMemberSensitivityWeight(sickElder)).toBeCloseTo(1.7);
  });
});
