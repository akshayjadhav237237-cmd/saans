import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiProvider } from '../src/ai/gemini';
import {
  DISCLOSED_FIELDS,
  DISCLOSURE_DESCRIPTIONS,
  buildSanitizedPayload,
} from '../src/ai/payload';
import type { DayPlan, HouseholdProfile } from '../src/domain/types';

describe('Privacy Canary and Data Minimization', () => {
  const CANARY_CITY = 'CANARY_CITY_DELHI_SECRET_123';
  const CANARY_NICKNAME = 'CANARY_NICKNAME_GUDDU_SECRET_456';
  const CANARY_API_KEY = 'AIzaSyCANARY_SECRET_API_KEY_789';

  const canaryProfile: HouseholdProfile = {
    id: 'h-secret-canary',
    name: CANARY_NICKNAME,
    city: CANARY_CITY,
    members: [
      { id: 'canary-member-alpha', role: 'adult', hasRespiratoryCondition: false },
      { id: 'canary-member-beta', role: 'child', hasRespiratoryCondition: true },
    ],
  };

  const samplePlan: DayPlan = {
    baselineExposure: {
      dailyDoseUg: 500,
      averageBreathedPm25: 150,
      cigaretteEquivalent: 6.8,
      memberExposures: [],
    },
    rankedActions: [
      {
        action: {
          id: 'purifier_bedroom',
          category: 'indoor',
          effort: 1,
          costBand: 2,
          titleKey: 'action.purifier_bedroom.title',
          descriptionKey: 'action.purifier_bedroom.desc',
          appliesTo: () => true,
          apply: (s) => s,
        },
        deltaDoseUg: 200,
        deltaPercent: 40,
        deltaCigaretteEq: 2.7,
      },
    ],
    optimizedScenario: { hours: [] },
    optimizedExposure: {
      dailyDoseUg: 300,
      averageBreathedPm25: 90,
      cigaretteEquivalent: 4.1,
      memberExposures: [],
    },
    bestWindows: [],
    generatedAt: '2026-11-19T08:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buildSanitizedPayload strictly strips city, name, member ids, and coordinates', () => {
    const payload = buildSanitizedPayload({
      profile: canaryProfile,
      aqiBandKey: 'aqi.band.unhealthy',
      pm25: 185,
      dayPlan: samplePlan,
      language: 'en',
    });
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain(CANARY_CITY);
    expect(serialized).not.toContain(CANARY_NICKNAME);
    expect(serialized).not.toContain('h-secret-canary');
    expect(serialized).not.toContain('canary-member-alpha');
    expect(serialized).not.toContain('canary-member-beta');

    // Only allowlisted keys exist in payload
    const keys = Object.keys(payload);
    const expectedContextFields = DISCLOSED_FIELDS.filter((f) => f !== 'userQuestion');
    expect(keys.sort()).toEqual(expectedContextFields.sort());
  });

  it('disclosure list exactly matches allowlist fields and descriptions', () => {
    const describedFields = DISCLOSURE_DESCRIPTIONS.map((d) => d.field);
    expect(describedFields.sort()).toEqual([...DISCLOSED_FIELDS].sort());
  });

  it('captures outbound Gemini request body and verifies total absence of canary PII', async () => {
    let capturedUrl = '';
    let capturedBody = '';
    let capturedHeaders: HeadersInit | undefined;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedBody = (init?.body as string) ?? '';
      capturedHeaders = init?.headers;
      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      summary: 'Your plan cuts dose by 40% using filtration.',
                      highlights: ['Run purifier at night to reduce 40% dose'],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      };
    });

    const payload = buildSanitizedPayload({
      profile: canaryProfile,
      aqiBandKey: 'aqi.band.unhealthy',
      pm25: 185,
      dayPlan: samplePlan,
      language: 'en',
    });
    const res = await GeminiProvider.explainPlan({ payload, apiKey: CANARY_API_KEY });

    expect(res.ok).toBe(true);
    expect(capturedBody).not.toContain(CANARY_CITY);
    expect(capturedBody).not.toContain(CANARY_NICKNAME);
    expect(capturedBody).not.toContain('h-secret-canary');

    // API Key must never be in the URL query string
    expect(capturedUrl).not.toContain(CANARY_API_KEY);
    expect(capturedUrl).not.toContain('key=');

    // API Key must be passed exclusively via X-goog-api-key header
    const headers = capturedHeaders as Record<string, string>;
    expect(headers['X-goog-api-key']).toBe(CANARY_API_KEY);

    // Verify API key is never written to localStorage or sessionStorage
    if (typeof window !== 'undefined') {
      expect(window.localStorage?.getItem('saans.api_key')).toBeNull();
      expect(window.sessionStorage?.getItem('saans.api_key')).toBeNull();
    }
  });

  it('canary typed inside question is present only in question field, nowhere else', async () => {
    let capturedBody = '';

    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = (init?.body as string) ?? '';
      return {
        ok: true,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ text: 'Protective answer.' }) }] } },
          ],
        }),
      };
    });

    const QUESTION_CANARY = 'QUESTION_CANARY_SECRET_789';
    const payload = buildSanitizedPayload({
      profile: canaryProfile,
      aqiBandKey: 'aqi.band.unhealthy',
      pm25: 185,
      dayPlan: samplePlan,
      language: 'en',
    });
    const res = await GeminiProvider.answerQuestion({
      question: `Is it safe to walk? ${QUESTION_CANARY}`,
      payload,
      apiKey: CANARY_API_KEY,
    });
    expect(res.ok).toBe(true);
    expect(capturedBody).toContain(QUESTION_CANARY);
    const parsed = JSON.parse(capturedBody) as { contents?: { parts?: { text?: string }[] }[] };
    const prompt = parsed.contents?.[0]?.parts?.[0]?.text ?? '';
    expect(prompt).toContain(`User Question: Is it safe to walk? ${QUESTION_CANARY}`);
    const contextJson = prompt.split('User Question:')[0] ?? '';
    expect(contextJson).not.toContain(QUESTION_CANARY);
    expect(capturedBody).not.toContain(CANARY_CITY);
    expect(capturedBody).not.toContain(CANARY_NICKNAME);
  });
});
