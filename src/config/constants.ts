/** Application constants and service configuration values. */
export const APP_CONFIG = {
  appName: 'Saans',
  appVersion: '0.1.0',
  defaultLanguage: 'en',
  attributionText: 'Air quality data: Open-Meteo, CAMS ENSEMBLE (Copernicus)',
  maxExposureHours: 24,
  sessionCacheTtlMinutes: 30,
} as const;

/** Canonical Gemini model identifier used for natural language assistance and plan explanations. */
export const GEMINI_MODEL_ID = 'gemini-2.5-flash';

/** Base endpoint for Gemini REST generateContent calls. */
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
