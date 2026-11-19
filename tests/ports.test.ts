import { describe, it, expect } from 'vitest';
import { createSystemClock, createCounterIdGen } from '../src/domain/ports';

describe('System clock and identifier generator ports', () => {
  it('provides timestamps from the system clock', () => {
    const clock = createSystemClock();
    const now = clock.now();
    expect(now).toBeGreaterThan(0);
    expect(typeof clock.iso()).toBe('string');
  });

  it('generates sequential unique identifiers', () => {
    const idGen = createCounterIdGen('entry');
    const id1 = idGen.nextId();
    const id2 = idGen.nextId();
    expect(id1).toBe('entry_1');
    expect(id2).toBe('entry_2');
    expect(id1).not.toBe(id2);
  });
});
