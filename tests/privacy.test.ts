import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiProvider } from '../src/ai/gemini';
import {
  DISCLOSED_FIELDS,
  DISCLOSURE_DESCRIPTIONS,
  buildSanitizedPayload,
} from '../src/ai/payload';
import type { DayPlan, HouseholdProfile, RankedAction, Scenario } from '../src/domain/types';

/** Creates a mock ranked action for testing payload sanitation. */
function createMockAction(id: string, deltaPercent: number): RankedAction {
  const action = {
    id,
    category: 'indoor' as const,
    effort: 1 as const,
    costBand: 1 as const,
    titleKey: `action.${id}.title`,
    descriptionKey: `action.${id}.desc`,
    appliesTo: () => true,
    apply: (s: Scenario): Scenario => s,
  };
  return { action, deltaDoseUg: 120, deltaPercent, deltaCigaretteEq: 2.1 };
}

const mockExp = {
  dailyDoseUg: 450,
  averageBreathedPm25: 140,
  cigaretteEquivalent: 6,
  memberExposures: [],
};

/** Creates a mock day plan for testing payload sanitation. */
function createMockPlan(actions: readonly RankedAction[]): DayPlan {
  return {
    baselineExposure: mockExp,
    rankedActions: actions,
    optimizedScenario: { hours: [] },
    optimizedExposure: mockExp,
    bestWindows: [],
    generatedAt: '2026-11-19T00:00:00.000Z',
  };
}

const mockProfile: HouseholdProfile = {
  id: 'household-uuid-secret',
  name: 'Private Household',
  city: 'Delhi-NCR 110001',
  members: [
    { id: 'mem-1', role: 'elder', hasRespiratoryCondition: true },
    { id: 'mem-2', role: 'child', hasRespiratoryCondition: false },
  ],
};

/** Helper to build a sanitized test payload. */
function createTestPayload(pm: number, actions: readonly RankedAction[] = []) {
  return buildSanitizedPayload({
    profile: mockProfile,
    aqiBandKey: 'aqi.band.hazardous',
    pm25: pm,
    dayPlan: createMockPlan(actions),
    language: 'en',
  });
}

/** Wraps text in a Gemini API response shape. */
function mockGeminiBody(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

describe('AI Privacy Contracts and Protections', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buildSanitizedPayload strips PII, caps actions to 5, and rounds PM2.5', () => {
    const actions = [30, 25, 20, 15, 10, 5].map((d, i) => createMockAction(`act${i + 1}`, d));
    const payload = buildSanitizedPayload({
      profile: mockProfile,
      aqiBandKey: 'aqi.band.hazardous',
      pm25: 187.6,
      dayPlan: createMockPlan(actions),
      language: 'en',
    });

    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('household-uuid-secret');
    expect(serialized).not.toContain('Private Household');
    expect(serialized).not.toContain('Delhi-NCR');
    expect(serialized).not.toContain('mem-1');
    expect(serialized).not.toContain('hasRespiratoryCondition');

    expect(payload.roundedPm25).toBe(188);
    expect(payload.memberKinds).toEqual(['elder', 'child']);
    expect(payload.actions).toHaveLength(5);
    expect(payload.actions[0]).toEqual({ id: 'act1', deltaPercent: 30 });
    expect(Object.keys(payload).sort()).toEqual([...DISCLOSED_FIELDS].sort());
  });

  it('disclosure table aligns with disclosed fields and i18n keys', () => {
    const fields = DISCLOSURE_DESCRIPTIONS.map((d) => d.field);
    expect(fields.sort()).toEqual([...DISCLOSED_FIELDS].sort());
    for (const d of DISCLOSURE_DESCRIPTIONS) {
      expect(d.descriptionKey.startsWith('ai.disclosure.')).toBe(true);
    }
  });

  it('GeminiProvider rejects empty API key without invoking network', async () => {
    const spy = vi.fn();
    global.fetch = spy;
    const payload = createTestPayload(60);

    const expRes = await GeminiProvider.explainPlan({ payload, apiKey: '  ' });
    const ansRes = await GeminiProvider.answerQuestion({
      question: 'q',
      payload,
      apiKey: '',
    });
    expect(expRes.ok).toBe(false);
    expect(ansRes.ok).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('GeminiProvider enforces header auth and sanitization in request body', async () => {
    let capturedUrl = '';
    let capturedBody = '';
    let capturedHeaderKey = '';

    const validMock = JSON.stringify({
      summary: 'Valid plan summary here.',
      highlights: ['Wear N95 outdoors'],
    });

    global.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = typeof init?.body === 'string' ? init.body : '';
      const headers = init?.headers as Record<string, string> | undefined;
      capturedHeaderKey = headers?.['X-goog-api-key'] ?? '';
      return { ok: true, json: async () => mockGeminiBody(validMock) } as unknown as Response;
    });

    const payload = createTestPayload(250);
    const res = await GeminiProvider.explainPlan({ payload, apiKey: 'test-key' });

    expect(res.ok).toBe(true);
    expect(capturedHeaderKey).toBe('test-key');
    expect(capturedUrl).not.toContain('test-key');
    expect(capturedUrl).not.toContain('key=');
    expect(capturedBody).not.toContain('Delhi');
    expect(capturedBody).not.toContain('Private Household');
  });

  it('GeminiProvider rejects ungrounded numbers to prevent hallucinated claims', async () => {
    const ungroundedMock = JSON.stringify({
      summary: 'Drops by 88% tomorrow.',
      highlights: ['Wear N95 mask'],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiBody(ungroundedMock),
    });

    const payload = createTestPayload(150, [createMockAction('act1', 25)]);
    const res = await GeminiProvider.explainPlan({ payload, apiKey: 'k' });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('ai.error.ungrounded_numbers');
  });

  it('GeminiProvider handles schema violation gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiBody('NOT_VALID_JSON'),
    });

    const payload = createTestPayload(150);
    const res = await GeminiProvider.explainPlan({ payload, apiKey: 'k' });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('ai.error.schema_violation');
  });
});
