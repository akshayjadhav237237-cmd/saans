import { beforeEach, describe, expect, it } from 'vitest';
import type { GeoLocation } from '../src/data/types';
import type { HouseholdProfile } from '../src/domain/types';
import { migrateState } from '../src/state/migrate';
import {
  clearPersistedState,
  getDefaultPersistedState,
  loadPersistedState,
  savePersistedState,
  STORAGE_KEY,
} from '../src/state/persist';

describe('Versioned Persistence Engine (P5-A)', () => {
  const sampleCity: GeoLocation = {
    id: 101,
    name: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    country: 'India',
    admin1: 'Maharashtra',
  };

  const sampleProfile: HouseholdProfile = {
    id: 'h_test_1',
    name: 'Test Household',
    city: 'Pune',
    members: [
      { id: 'm_1', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm_2', role: 'elder', hasRespiratoryCondition: true },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  function assertLocalStorageResetsToDefault(storedPayload: string): void {
    localStorage.setItem(STORAGE_KEY, storedPayload);
    const loadRes = loadPersistedState();
    expect(loadRes.ok).toBe(true);
    if (loadRes.ok) {
      expect(loadRes.value).toEqual(getDefaultPersistedState());
    }
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  }

  it('loads default state cleanly when storage is empty', () => {
    const res = loadPersistedState();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toEqual(getDefaultPersistedState());
      expect(res.value.version).toBe(2);
    }
  });

  it('saves and reloads state roundtrip cleanly with lifestyle fields', () => {
    const saveRes = savePersistedState({
      profile: { ...sampleProfile, commuteMode: 'commute_public', hasAirPurifier: true },
      language: 'hi',
      selectedCity: sampleCity,
    });
    expect(saveRes.ok).toBe(true);

    const loadRes = loadPersistedState();
    expect(loadRes.ok).toBe(true);
    if (loadRes.ok) {
      expect(loadRes.value.version).toBe(2);
      expect(loadRes.value.language).toBe('hi');
      expect(loadRes.value.profile.city).toBe('Pune');
      expect(loadRes.value.profile.commuteMode).toBe('commute_public');
      expect(loadRes.value.profile.hasAirPurifier).toBe(true);
      expect(loadRes.value.selectedCity?.name).toBe('Pune');
    }
  });

  it('guarantees data minimization: never stores api keys or raw ai text', () => {
    const dangerousInput = {
      profile: sampleProfile,
      language: 'en' as const,
      selectedCity: sampleCity,
      aiKey: 'AIzaSy_SECRET_KEY_NEVER_PERSIST',
      rawAiText: 'SENSITIVE_AI_CONVERSATION_PAYLOAD',
      airData: { currentAqi: 350 },
    };

    savePersistedState(dangerousInput);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    if (raw) {
      expect(raw).not.toContain('AIzaSy_SECRET_KEY_NEVER_PERSIST');
      expect(raw).not.toContain('SENSITIVE_AI_CONVERSATION_PAYLOAD');
      expect(raw).not.toContain('aiKey');
      expect(raw).not.toContain('rawAiText');
      expect(raw).not.toContain('currentAqi');
    }
  });

  it('resets corrupt JSON safely and clears the corrupted storage key', () => {
    assertLocalStorageResetsToDefault('{ invalid json corrupt payload ...');
  });

  it('resets corrupt schema data safely and returns defaults', () => {
    const broken = {
      version: 1,
      profile: { id: 'x', name: 'Broken', city: 'Delhi', members: [{ role: 'bad_role' }] },
      language: 'invalid_lang',
      selectedCity: null,
    };
    assertLocalStorageResetsToDefault(JSON.stringify(broken));
  });

  it('migrates legacy v0 and v1 state to current v2 schema with safe lifestyle defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: sampleProfile, language: 'hi' }));
    const resV0 = loadPersistedState();
    expect(resV0.ok).toBe(true);
    if (resV0.ok) {
      expect(resV0.value.version).toBe(2);
      expect(resV0.value.profile.commuteMode).toBe('commute_two_wheeler');
      expect(resV0.value.profile.hasAirPurifier).toBe(false);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, profile: sampleProfile, language: 'en', selectedCity: null }),
    );
    const resV1 = loadPersistedState();
    expect(resV1.ok).toBe(true);
    if (resV1.ok) {
      expect(resV1.value.version).toBe(2);
      expect(resV1.value.profile.id).toBe(sampleProfile.id);
      expect(resV1.value.profile.commuteMode).toBe('commute_two_wheeler');
      expect(resV1.value.profile.hasAirPurifier).toBe(false);
    }

    const corruptV2 = {
      version: 2,
      profile: { ...sampleProfile, commuteMode: 'rocket' },
      language: 'en',
      selectedCity: null,
    };
    assertLocalStorageResetsToDefault(JSON.stringify(corruptV2));
  });

  it('resets safely when encountering unsupported future schema versions', () => {
    const future = { version: 99, profile: sampleProfile, language: 'en', selectedCity: null };
    assertLocalStorageResetsToDefault(JSON.stringify(future));
  });

  it('clears persisted state cleanly when clearPersistedState is called', () => {
    savePersistedState({ profile: sampleProfile, language: 'en', selectedCity: null });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    const clearRes = clearPersistedState();
    expect(clearRes.ok).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('handles isolated migrateState edge cases deterministically', () => {
    expect(migrateState(null).ok).toBe(false);
    expect(migrateState('string').ok).toBe(false);
    expect(migrateState({ version: -1 }).ok).toBe(false);

    const v0Res = migrateState({});
    expect(v0Res.ok).toBe(true);
    if (v0Res.ok) {
      expect(v0Res.value.version).toBe(2);
      expect(v0Res.value.language).toBe('en');
    }
    expect(migrateState({ version: 0 }, 2, {}).ok).toBe(false);
  });

  it('catches and reports storage access exceptions across all operations', () => {
    const throwingStorage: Storage = {
      getItem: () => {
        throw new Error('SecurityError: access denied');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('AccessDenied');
      },
      clear: () => {},
      key: () => null,
      length: 0,
    };

    const input = { profile: sampleProfile, language: 'en' as const, selectedCity: null };
    expect(loadPersistedState(throwingStorage).ok).toBe(false);
    expect(savePersistedState(input, throwingStorage).ok).toBe(false);
    expect(clearPersistedState(throwingStorage).ok).toBe(false);
  });
});
