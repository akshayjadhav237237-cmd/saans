import { describe, it, expect } from 'vitest';
import { ok, err, map } from '../src/domain/result';

describe('Result container and combinators', () => {
  it('creates successful Ok results holding values', () => {
    const res = ok(42);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(42);
    }
  });

  it('creates Err results holding typed error states', () => {
    const res = err('RESOURCE_NOT_FOUND');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('RESOURCE_NOT_FOUND');
    }
  });

  it('transforms Ok values using map while preserving Ok status', () => {
    const initial = ok(10);
    const mapped = map(initial, (n) => n * 2);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(20);
    }
  });

  it('passes through Err states without invoking map transformation', () => {
    const initial = err<number, string>('FAILED');
    const mapped = map(initial, (n) => n * 2);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe('FAILED');
    }
  });
});
