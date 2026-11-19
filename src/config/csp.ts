/**
 * Content Security Policy configuration.
 * Single source of truth for build-time meta injection and tests.
 */
export const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'font-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://air-quality-api.open-meteo.com',
    'https://geocoding-api.open-meteo.com',
    'https://generativelanguage.googleapis.com',
  ],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  'object-src': ["'none'"],
} as const;

/**
 * Builds serialized CSP string for HTML meta element.
 */
export function buildCspString(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, vals]) => `${key} ${vals.join(' ')}`)
    .join('; ');
}
