import { z } from 'zod';
import type { GeoLocation } from '../data/types';
import { err, ok, type Result } from '../domain/result';
import type { HouseholdProfile } from '../domain/types';
import type { Language } from '../i18n';
import { CURRENT_SCHEMA_VERSION, DEFAULT_MIGRATION_PROFILE, migrateState } from './migrate';

z.config({ jitless: true });

export const STORAGE_KEY = 'saans.v1';

const MemberRoleSchema = z.enum(['child', 'adult', 'elder']);

const HouseholdMemberSchema = z.object({
  id: z.string().min(1),
  role: MemberRoleSchema,
  hasRespiratoryCondition: z.boolean(),
});

const HouseholdProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  members: z.array(HouseholdMemberSchema).readonly(),
});

const LanguageSchema = z.enum(['en', 'hi']);

const GeoLocationSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().min(1),
  admin1: z.string().optional(),
});

export const PersistedStateSchema = z.object({
  version: z.number().int().positive(),
  profile: HouseholdProfileSchema,
  language: LanguageSchema,
  selectedCity: GeoLocationSchema.nullable(),
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;

export interface PersistInput {
  readonly profile: HouseholdProfile;
  readonly language: Language;
  readonly selectedCity: GeoLocation | null;
  readonly version?: number;
}

/** Resolves window localStorage safely handling permissions errors or missing environment. */
function resolveStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Storage access denied
  }
  return null;
}

/** Resets storage key cleanly when corruption is encountered and provides safe defaults. */
function resetCorruptStorage(s: Storage | null): PersistedState {
  try {
    s?.removeItem(STORAGE_KEY);
  } catch {
    // Suppress storage exceptions during safe reset
  }
  return getDefaultPersistedState();
}

/** Returns default persisted configuration for clean initial sessions and corrupt-data resets. */
export function getDefaultPersistedState(): PersistedState {
  return {
    version: CURRENT_SCHEMA_VERSION,
    profile: DEFAULT_MIGRATION_PROFILE,
    language: 'en',
    selectedCity: null,
  };
}

/** Removes persisted application state from local storage for data erasure workflows. */
export function clearPersistedState(storage?: Storage): Result<void, string> {
  try {
    const s = resolveStorage(storage);
    if (!s) return err('storage.unavailable');
    s.removeItem(STORAGE_KEY);
    return ok(undefined);
  } catch {
    return err('storage.clear_failed');
  }
}

/** Persists privacy-sanitized user profile and settings to versioned local storage. */
export function savePersistedState(state: PersistInput, storage?: Storage): Result<void, string> {
  try {
    const s = resolveStorage(storage);
    if (!s) return err('storage.unavailable');

    const sanitized: PersistedState = {
      version: CURRENT_SCHEMA_VERSION,
      profile: state.profile,
      language: state.language,
      selectedCity: state.selectedCity,
    };

    const validation = PersistedStateSchema.safeParse(sanitized);
    if (!validation.success) return err('storage.invalid_schema');

    s.setItem(STORAGE_KEY, JSON.stringify(validation.data));
    return ok(undefined);
  } catch {
    return err('storage.save_failed');
  }
}

/** Reads, migrates, and validates persisted user settings from local storage safely. */
export function loadPersistedState(storage?: Storage): Result<PersistedState, string> {
  try {
    const s = resolveStorage(storage);
    if (!s) return ok(getDefaultPersistedState());

    const raw = s.getItem(STORAGE_KEY);
    if (raw === null) return ok(getDefaultPersistedState());

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return ok(resetCorruptStorage(s));
    }

    const migrated = migrateState(parsed);
    if (!migrated.ok) return ok(resetCorruptStorage(s));

    const validated = PersistedStateSchema.safeParse(migrated.value);
    if (!validated.success) return ok(resetCorruptStorage(s));

    return ok(validated.data);
  } catch {
    return err('storage.read_failed');
  }
}
