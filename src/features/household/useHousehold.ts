import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { err, ok, type Result } from '../../domain/result';
import { validateHouseholdProfile } from '../../domain/household';
import { createCounterIdGen, type IdGen } from '../../domain/ports';
import type { HouseholdMember, HouseholdProfile, MemberRole } from '../../domain/types';
import { translate, type Language } from '../../i18n';
import { useAppStore } from '../../state/store';
import {
  assessHouseholdSensitivity,
  canAddMember,
  createDefaultMember,
  mapValidationError,
  type CommuteMode,
} from './household.viewmodel';

export interface UseHouseholdOptions {
  readonly idGen?: IdGen | undefined;
}

export interface MemberActions {
  readonly addMember: (role?: MemberRole) => void;
  readonly removeMember: (memberId: string) => void;
  readonly updateMemberRole: (memberId: string, role: MemberRole) => void;
  readonly toggleRespiratoryCondition: (memberId: string) => void;
}

export interface UseHouseholdReturn extends MemberActions {
  readonly name: string;
  readonly setName: (name: string) => void;
  readonly members: readonly HouseholdMember[];
  readonly commuteMode: CommuteMode;
  readonly setCommuteMode: (mode: CommuteMode) => void;
  readonly hasAirPurifier: boolean;
  readonly setHasAirPurifier: (has: boolean) => void;
  readonly notice: string | null;
  readonly error: string | null;
  readonly canAdd: boolean;
  readonly hasVulnerable: boolean;
  readonly save: () => Result<HouseholdProfile, string>;
  readonly reset: () => void;
}

/** Adds a new member to an existing member list if capacity allows. */
export function addMemberToList(
  members: readonly HouseholdMember[],
  id: string,
  role: MemberRole,
): readonly HouseholdMember[] {
  if (!canAddMember(members.length)) return members;
  return [...members, createDefaultMember(id, role)];
}

/** Removes a member by identifier from the member list. */
export function removeMemberFromList(
  members: readonly HouseholdMember[],
  memberId: string,
): readonly HouseholdMember[] {
  return members.filter((m) => m.id !== memberId);
}

/** Updates demographic role for a targeted member in the list. */
export function updateMemberRoleInList(
  members: readonly HouseholdMember[],
  memberId: string,
  role: MemberRole,
): readonly HouseholdMember[] {
  return members.map((m) => (m.id === memberId ? { ...m, role } : m));
}

/** Toggles respiratory sensitivity status for a targeted member in the list. */
export function toggleRespiratoryInList(
  members: readonly HouseholdMember[],
  memberId: string,
): readonly HouseholdMember[] {
  return members.map((m) =>
    m.id === memberId ? { ...m, hasRespiratoryCondition: !m.hasRespiratoryCondition } : m,
  );
}

/** Constructs a candidate household profile for validation and persistence. */
export function buildCandidateProfile(
  id: string,
  name: string,
  city: string,
  members: readonly HouseholdMember[],
): HouseholdProfile {
  return { id, name: name.trim(), city, members };
}

/** Validates and commits an updated household profile to the global store. */
export function performProfileSave(
  profile: HouseholdProfile,
  language: Language,
  setStoreProfile: (p: HouseholdProfile) => void,
): Result<HouseholdProfile, string> {
  const valResult = validateHouseholdProfile(profile);
  if (!valResult.ok) return err(mapValidationError(valResult.error, language));
  setStoreProfile(profile);
  return ok(profile);
}

/** Creates member manipulation callbacks bound to React state setters. */
export function createMemberActions(
  members: readonly HouseholdMember[],
  generator: IdGen,
  setMembers: Dispatch<SetStateAction<readonly HouseholdMember[]>>,
): MemberActions {
  return {
    addMember: (role = 'adult') => {
      if (canAddMember(members.length))
        setMembers((p) => addMemberToList(p, generator.nextId(), role));
    },
    removeMember: (id: string) => setMembers((prev) => removeMemberFromList(prev, id)),
    updateMemberRole: (id: string, role: MemberRole) =>
      setMembers((p) => updateMemberRoleInList(p, id, role)),
    toggleRespiratoryCondition: (id: string) => setMembers((p) => toggleRespiratoryInList(p, id)),
  };
}

/** React view-model hook managing household profile editing, members, commute mode, and purifier state. */
export function useHousehold(options?: UseHouseholdOptions): UseHouseholdReturn {
  const storeProfile = useAppStore((state) => state.profile);
  const setStoreProfile = useAppStore((state) => state.setProfile);
  const language = useAppStore((state) => state.language);

  const [name, setName] = useState<string>(storeProfile.name);
  const [members, setMembers] = useState<readonly HouseholdMember[]>(storeProfile.members);
  const [commuteMode, setCommuteMode] = useState<CommuteMode>('commute_two_wheeler');
  const [hasAirPurifier, setHasAirPurifier] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const genRef = useRef<IdGen | null>(null);
  if (!genRef.current) genRef.current = options?.idGen ?? createCounterIdGen('m');
  const generator = options?.idGen ?? genRef.current;

  useEffect(() => {
    setName(storeProfile.name);
    setMembers(storeProfile.members);
  }, [storeProfile]);

  const save = (): Result<HouseholdProfile, string> => {
    const candidate = buildCandidateProfile(storeProfile.id, name, storeProfile.city, members);
    const res = performProfileSave(candidate, language, setStoreProfile);
    setError(res.ok ? null : res.error);
    setNotice(res.ok ? translate(language, 'household.saved') : null);
    return res;
  };

  const memberActions = createMemberActions(members, generator, setMembers);

  return {
    name,
    setName,
    members,
    commuteMode,
    setCommuteMode,
    hasAirPurifier,
    setHasAirPurifier,
    notice,
    error,
    canAdd: canAddMember(members.length),
    hasVulnerable: assessHouseholdSensitivity(members).hasVulnerable,
    ...memberActions,
    save,
    reset: () => {
      setName(storeProfile.name);
      setMembers(storeProfile.members);
      setError(null);
      setNotice(null);
    },
  };
}
