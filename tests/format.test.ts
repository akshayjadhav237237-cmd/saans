import { describe, expect, it } from 'vitest';
import { roundInteger, roundOneDecimal } from '../src/domain/format';

describe('Format Engine', () => {
  describe('roundInteger', () => {
    it('rounds positive floats to nearest integer', () => {
      expect(roundInteger(42.4)).toBe(42);
      expect(roundInteger(42.5)).toBe(43);
      expect(roundInteger(42.6)).toBe(43);
    });

    it('preserves exact integers and zero', () => {
      expect(roundInteger(0)).toBe(0);
      expect(roundInteger(100)).toBe(100);
      expect(roundInteger(-50)).toBe(-50);
    });

    it('rounds negative floats correctly', () => {
      expect(roundInteger(-42.4)).toBe(-42);
      expect(roundInteger(-42.6)).toBe(-43);
    });
  });

  describe('roundOneDecimal', () => {
    it('rounds floats to exactly one decimal place', () => {
      expect(roundOneDecimal(42.456)).toBe(42.5);
      expect(roundOneDecimal(42.01)).toBe(42.0);
      expect(roundOneDecimal(42.06)).toBe(42.1);
      expect(roundOneDecimal(3.14159)).toBe(3.1);
    });

    it('preserves whole numbers and single decimal values', () => {
      expect(roundOneDecimal(0)).toBe(0);
      expect(roundOneDecimal(10)).toBe(10);
      expect(roundOneDecimal(10.5)).toBe(10.5);
    });

    it('rounds negative floats to one decimal place', () => {
      expect(roundOneDecimal(-42.456)).toBe(-42.5);
      expect(roundOneDecimal(-0.04)).toBe(-0);
      expect(roundOneDecimal(-0.06)).toBe(-0.1);
    });
  });
});
