import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiProvider } from '../src/ai/gemini';
import { LocalProvider } from '../src/ai/local';
import type { SanitizedPayload } from '../src/ai/port';
import { answerWithFallback, explainWithFallback, selectProvider } from '../src/ai/select';

describe('AI Providers & Fallback Engine', () => {
  const payload: SanitizedPayload = {
    aqiBandKey: 'aqi.band.hazardous',
    roundedPm25: 350,
    memberKinds: ['adult', 'child'],
    actions: [
      { id: 'purifier_bedroom', deltaPercent: 50 },
      { id: 'commute_n95_mask', deltaPercent: 25 },
    ],
    language: 'en',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('LocalProvider explains plan deterministically and answers intent-matched topics', async () => {
    const expEn = await LocalProvider.explainPlan({ payload });
    expect(expEn.ok).toBe(true);
    if (expEn.ok) {
      expect(expEn.value.summary).toContain('50%');
      expect(expEn.value.highlights.length).toBeGreaterThan(0);
    }

    const ansMask = await LocalProvider.answerQuestion({
      question: 'Which mask should I wear?',
      payload,
    });
    expect(ansMask.ok).toBe(true);
    if (ansMask.ok) {
      expect(ansMask.value.text).toContain('N95');
      expect(ansMask.value.suggestedActionId).toBe('commute_n95_mask');
    }

    const ansCooking = await LocalProvider.answerQuestion({
      question: 'How to manage cooking smoke?',
      payload,
    });
    expect(ansCooking.ok).toBe(true);
    if (ansCooking.ok) {
      expect(ansCooking.value.text).toContain('exhaust');
    }

    const ansUnknown = await LocalProvider.answerQuestion({
      question: 'What is the stock market trend?',
      payload,
    });
    expect(ansUnknown.ok).toBe(true);
  });

  it('LocalProvider handles Hindi language responses correctly', async () => {
    const hindiPayload = { ...payload, language: 'hi' as const };
    const expHi = await LocalProvider.explainPlan({ payload: hindiPayload });
    expect(expHi.ok).toBe(true);
    if (expHi.ok) {
      expect(expHi.value.summary).toContain('50%');
    }

    const ansHi = await LocalProvider.answerQuestion({
      question: 'क्या प्यूरीफायर जरूरी है?',
      payload: hindiPayload,
    });
    expect(ansHi.ok).toBe(true);
  });

  it('GeminiProvider rejects calls with missing or empty API key', async () => {
    const exp = await GeminiProvider.explainPlan({ payload, apiKey: '' });
    expect(exp.ok).toBe(false);
    if (!exp.ok) expect(exp.error).toBe('ai.error.missing_api_key');

    const ans = await GeminiProvider.answerQuestion({
      question: 'How to seal doors?',
      payload,
      apiKey: '   ',
    });
    expect(ans.ok).toBe(false);
  });

  it('GeminiProvider rejects responses containing ungrounded numbers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summary: 'Tomorrow PM2.5 drops to 89.',
                    highlights: ['Outdoor air drops by 99%'],
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const res = await GeminiProvider.explainPlan({ payload, apiKey: 'test-key' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('ai.error.ungrounded_numbers');
  });

  it('GeminiProvider retries on 500 error before failing safely', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount += 1;
      return { ok: false, status: 500 };
    });

    const res = await GeminiProvider.explainPlan({ payload, apiKey: 'test-key' });
    expect(res.ok).toBe(false);
    expect(callCount).toBe(2); // Initial attempt + 1 retry
  });

  it('selectProvider and fallback helpers fall back to LocalProvider when Gemini fails', async () => {
    expect(selectProvider().id).toBe('local');
    expect(selectProvider('valid-key').id).toBe('gemini');

    // Mock Gemini failure
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const fallbackExp = await explainWithFallback({ payload, apiKey: 'invalid-key' });
    expect(fallbackExp.summary).toBeDefined();
    expect(fallbackExp.highlights.length).toBeGreaterThan(0);

    const fallbackAns = await answerWithFallback({
      question: 'Which mask to choose?',
      payload,
      apiKey: 'invalid-key',
    });
    expect(fallbackAns.text).toContain('N95');
  });

  it('GeminiProvider and fallback helpers succeed when Gemini returns valid structured JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    text: 'Keep all windows sealed and operate a HEPA air cleaner continuously.',
                    suggestedActionId: 'purifier_bedroom',
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const ans = await GeminiProvider.answerQuestion({
      question: 'How to clean air?',
      payload,
      apiKey: 'valid-key',
    });
    expect(ans.ok).toBe(true);
    if (ans.ok) {
      expect(ans.value.text).toContain('HEPA');
      expect(ans.value.suggestedActionId).toBe('purifier_bedroom');
    }

    const fallbackAns = await answerWithFallback({
      question: 'How to clean air?',
      payload,
      apiKey: 'valid-key',
    });
    expect(fallbackAns.text).toContain('HEPA');
  });
});
