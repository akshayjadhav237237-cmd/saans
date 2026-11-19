import { err, ok, type Result } from '../domain/result';
import type { HouseholdProfile } from '../domain/types';

export const CURRENT_SCHEMA_VERSION = 1;

export type MigrationStep = (data: Record<string, unknown>) => Record<string, unknown>;

export const DEFAULT_MIGRATION_PROFILE: HouseholdProfile = {
  id: 'h_default',
  name: 'Our Family',
  city: 'Delhi',
  members: [
    { id: 'm_adult_1', role: 'adult', hasRespiratoryCondition: false },
    { id: 'm_child_1', role: 'child', hasRespiratoryCondition: false },
  ],
};

/** Extracts normalized integer version from record or defaults to zero. */
function extractVersion(record: Record<string, unknown>): number {
  const versionProp = record.version;
  if (typeof versionProp === 'number' && Number.isInteger(versionProp)) {
    return versionProp;
  }
  return 0;
}

/** Validates raw value is a non-null non-array object record. */
function parseRecordInput(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }
  return raw as Record<string, unknown>;
}

/** Migrates legacy unversioned stored payload to version 1 schema structure. */
function migrateStep0To1(data: Record<string, unknown>): Record<string, unknown> {
  const profile =
    typeof data.profile === 'object' && data.profile !== null
      ? data.profile
      : DEFAULT_MIGRATION_PROFILE;

  const language = data.language === 'hi' ? 'hi' : 'en';
  const selectedCity = data.selectedCity !== undefined ? data.selectedCity : null;

  return {
    version: 1,
    profile,
    language,
    selectedCity,
  };
}

export const MIGRATION_TABLE: Readonly<Record<number, MigrationStep>> = {
  0: migrateStep0To1,
};

/** Applies sequential schema transformation steps across version increments. */
function applyMigrationSteps(
  initialState: Record<string, unknown>,
  startVersion: number,
  targetVersion: number,
  table: Readonly<Record<number, MigrationStep>>,
): Result<Record<string, unknown>, string> {
  let state = { ...initialState };
  let ver = startVersion;

  while (ver < targetVersion) {
    const step = table[ver];
    if (!step) {
      return err(`migrate.missing_step_${ver}`);
    }
    try {
      state = step(state);
      ver += 1;
      state.version = ver;
    } catch {
      return err(`migrate.failed_at_step_${ver}`);
    }
  }

  return ok(state);
}

/** Migrates serialized state records across schema versions up to target version. */
export function migrateState(
  raw: unknown,
  targetVersion = CURRENT_SCHEMA_VERSION,
  table: Readonly<Record<number, MigrationStep>> = MIGRATION_TABLE,
): Result<Record<string, unknown>, string> {
  const record = parseRecordInput(raw);
  if (!record) {
    return err('migrate.invalid_input');
  }

  const currentVersion = extractVersion(record);
  if (currentVersion < 0) {
    return err('migrate.invalid_version');
  }

  if (currentVersion > targetVersion) {
    return err('migrate.future_version_unsupported');
  }

  return applyMigrationSteps(record, currentVersion, targetVersion, table);
}
