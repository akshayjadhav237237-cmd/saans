import { err, ok, type Result } from './result';
import type { HouseholdMember, HouseholdProfile } from './types';

export const MAX_HOUSEHOLD_MEMBERS = 6;

/**
 * Validates household profile data integrity and constraints.
 */
export function validateHouseholdProfile(
  profile: HouseholdProfile,
): Result<HouseholdProfile, string> {
  if (!profile.name || profile.name.trim().length === 0) {
    return err('profile.error.name_required');
  }
  if (!profile.city || profile.city.trim().length === 0) {
    return err('profile.error.city_required');
  }
  if (profile.members.length === 0) {
    return err('profile.error.members_required');
  }
  if (profile.members.length > MAX_HOUSEHOLD_MEMBERS) {
    return err('profile.error.max_members_exceeded');
  }
  for (const member of profile.members) {
    if (!member.id || member.id.trim().length === 0) {
      return err('profile.error.member_id_required');
    }
  }
  return ok(profile);
}

/**
 * Checks whether any member of the household belongs to an air pollution vulnerable group.
 */
export function hasVulnerableMembers(profile: HouseholdProfile): boolean {
  return profile.members.some(
    (member) =>
      member.role === 'child' || member.role === 'elder' || member.hasRespiratoryCondition,
  );
}

/**
 * Calculates a sensitivity weight multiplier for a specific household member.
 */
export function getMemberSensitivityWeight(member: HouseholdMember): number {
  let weight = 1.0;
  if (member.role === 'child' || member.role === 'elder') {
    weight += 0.3;
  }
  if (member.hasRespiratoryCondition) {
    weight += 0.4;
  }
  return weight;
}
