/** Rounds a floating-point numeric value to the nearest integer. */
export function roundInteger(value: number): number {
  return Math.round(value);
}

/** Rounds a floating-point numeric value to exactly one decimal place. */
export function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
