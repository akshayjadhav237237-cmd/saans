import { err, ok, type Result } from '../../domain/result';
import {
  MAX_HOUSEHOLD_MEMBERS,
  getMemberSensitivityWeight,
  validateHouseholdProfile,
} from '../../domain/household';
import type { HouseholdMember, HouseholdProfile, MemberRole } from '../../domain/types';
import { translate, type Language, type TranslationKey } from '../../i18n';

export type CommuteMode = 'commute_two_wheeler' | 'commute_walk' | 'commute_public' | 'commute_car';

export interface CommuteOption {
  readonly value: CommuteMode;
  readonly labelKey: TranslationKey;
}

export interface RoleOption {
  readonly value: MemberRole;
  readonly labelKey: TranslationKey;
}

export const COMMUTE_OPTIONS: readonly CommuteOption[] = [
  { value: 'commute_two_wheeler', labelKey: 'household.commute.two_wheeler' },
  { value: 'commute_walk', labelKey: 'household.commute.walk' },
  { value: 'commute_public', labelKey: 'household.commute.public' },
  { value: 'commute_car', labelKey: 'household.commute.car' },
];

export const MEMBER_ROLE_OPTIONS: readonly RoleOption[] = [
  { value: 'child', labelKey: 'household.member.role.child' },
  { value: 'adult', labelKey: 'household.member.role.adult' },
  { value: 'elder', labelKey: 'household.member.role.elder' },
];

export interface MemberSensitivityInfo {
  readonly isVulnerable: boolean;
  readonly weight: number;
}

export interface HouseholdSensitivitySummary {
  readonly totalMembers: number;
  readonly vulnerableCount: number;
  readonly hasVulnerable: boolean;
}

/** Resolves the translation dictionary key for a specific member demographic role. */
export function getRoleLabelKey(role: MemberRole): TranslationKey {
  switch (role) {
    case 'child':
      return 'household.member.role.child';
    case 'elder':
      return 'household.member.role.elder';
    case 'adult':
    default:
      return 'household.member.role.adult';
  }
}

/** Resolves the translation dictionary key for a specific commute mode. */
export function getCommuteLabelKey(mode: CommuteMode): TranslationKey {
  switch (mode) {
    case 'commute_two_wheeler':
      return 'household.commute.two_wheeler';
    case 'commute_walk':
      return 'household.commute.walk';
    case 'commute_public':
      return 'household.commute.public';
    case 'commute_car':
      return 'household.commute.car';
  }
}

/** Checks whether additional members can be added to the household. */
export function canAddMember(currentCount: number): boolean {
  return currentCount < MAX_HOUSEHOLD_MEMBERS;
}

/** Creates a new household member with default adult role and negative respiratory condition. */
export function createDefaultMember(id: string, role: MemberRole = 'adult'): HouseholdMember {
  return {
    id,
    role,
    hasRespiratoryCondition: false,
  };
}

/** Evaluates the clinical vulnerability and inhalation sensitivity weight for a member. */
export function assessMemberSensitivity(member: HouseholdMember): MemberSensitivityInfo {
  const isVulnerable =
    member.role === 'child' || member.role === 'elder' || member.hasRespiratoryCondition;
  return {
    isVulnerable,
    weight: getMemberSensitivityWeight(member),
  };
}

/** Summarizes demographic vulnerability and respiratory risk counts for a household profile. */
export function assessHouseholdSensitivity(
  members: readonly HouseholdMember[],
): HouseholdSensitivitySummary {
  const vulnerableCount = members.filter(
    (m) => m.role === 'child' || m.role === 'elder' || m.hasRespiratoryCondition,
  ).length;
  return {
    totalMembers: members.length,
    vulnerableCount,
    hasVulnerable: vulnerableCount > 0,
  };
}

/** Maps domain validation error keys into user-friendly localized error messages. */
export function mapValidationError(errorKey: string, lang: Language): string {
  return translate(lang, errorKey as TranslationKey);
}

/** Validates household profile inputs before persisting to the application store. */
export function validateHouseholdInputs(
  name: string,
  city: string,
  members: readonly HouseholdMember[],
): Result<boolean, string> {
  const candidate: HouseholdProfile = {
    id: 'temp',
    name: name.trim(),
    city: city.trim(),
    members,
  };
  const result = validateHouseholdProfile(candidate);
  if (!result.ok) {
    return err(result.error);
  }
  return ok(true);
}
