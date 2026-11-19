import type { SanitizedPayload } from './port';

/**
 * Extracts all allowable grounded numerical values from an action plan payload.
 */
export function buildAllowedNumbers(payload: SanitizedPayload): readonly number[] {
  const allowed = new Set<number>();
  allowed.add(payload.roundedPm25);
  for (const action of payload.actions) {
    allowed.add(action.deltaPercent);
  }
  return Array.from(allowed);
}

/**
 * Verifies that all numeric tokens within AI-generated text match pre-computed engine numbers.
 */
export function numbersAreGrounded(text: string, allowedNumbers: readonly number[]): boolean {
  // Strip standard pollutant designation labels (PM2.5, PM10) and mask ratings so their acronyms are not treated as numbers
  const cleanedText = text
    .replace(/PM\s*2\.5/gi, 'PM')
    .replace(/PM\s*10/gi, 'PM')
    .replace(/N-?95/gi, 'N95');
  const tokens = cleanedText.match(/\b\d+(\.\d+)?\b/g);
  if (!tokens || tokens.length === 0) {
    // Zero numbers in text is strictly safe under "AI returns words only" rule
    return true;
  }

  const allowedSet = new Set(allowedNumbers.map((n) => Math.round(n * 10) / 10));

  for (const token of tokens) {
    const val = parseFloat(token);
    const rounded = Math.round(val * 10) / 10;
    if (!allowedSet.has(rounded)) {
      return false;
    }
  }

  return true;
}
