import { err, ok, type Result } from '../domain/result';

const MAX_QUESTION_LENGTH = 280;
const MIN_QUESTION_LENGTH = 3;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+(a|an|in)/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /override\s+instructions/i,
  /(reveal|leak|print|show)\s+(the\s+)?(system|secret|api|hidden)/i,
  /act\s+as\s+a\s+(dan|hacker|root|admin)/i,
  /forget\s+(all\s+)?rules/i,
  /unrestricted\s+mode/i,
  /bypass\s+safety/i,
  /repeat\s+(everything|the\s+prompt)/i,
];

/**
 * Strips non-printable ASCII control characters without using control regexes.
 */
function sanitizeControlChars(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if ((code >= 32 && code !== 127) || code === 10 || code === 13 || code === 9) {
      result += text[i];
    } else {
      result += ' ';
    }
  }
  return result;
}

/**
 * Validates user question against length bounds and adversarial prompt-injection patterns.
 */
export function validateAndSanitizeQuestion(input: string): Result<string, string> {
  const sanitized = sanitizeControlChars(input).trim();

  if (sanitized.length < MIN_QUESTION_LENGTH) {
    return err('question.error.too_short');
  }

  if (sanitized.length > MAX_QUESTION_LENGTH) {
    return err('question.error.too_long');
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return err('question.error.injection_detected');
    }
  }

  return ok(sanitized);
}
