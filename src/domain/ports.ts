/**
 * System clock port interface for deterministic time operations.
 */
export interface Clock {
  readonly now: () => number;
  readonly iso: () => string;
}

/**
 * Identifier generator port interface for deterministic unique IDs.
 */
export interface IdGen {
  readonly nextId: () => string;
}

/**
 * Creates a system clock instance backed by standard time utilities.
 */
export function createSystemClock(): Clock {
  return {
    now: () => Date.now(),
    iso: () => new Date().toISOString(),
  };
}

/**
 * Creates an incremental identifier generator suitable for testing or deterministic runs.
 */
export function createCounterIdGen(prefix = 'id'): IdGen {
  let counter = 0;
  return {
    nextId: () => `${prefix}_${++counter}`,
  };
}
