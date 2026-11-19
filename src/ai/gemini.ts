import { GEMINI_API_BASE_URL, GEMINI_MODEL_ID } from '../config/models';
import { err, ok, type Result } from '../domain/result';
import { buildAllowedNumbers, numbersAreGrounded } from './grounding';
import type {
  AiAnswer,
  AiExplanation,
  AiProvider,
  AnswerQuestionInput,
  ExplainPlanInput,
} from './port';
import { AiAnswerSchema, AiExplanationSchema } from './schema';

const TIMEOUT_MS = 15000;

interface GeminiResponse {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly { readonly text?: string }[];
    };
  }[];
}

interface GeminiCallParams {
  readonly prompt: string;
  readonly systemPrompt: string;
  readonly schema: unknown;
  readonly apiKey: string;
}

interface SingleAttemptOutcome {
  readonly text?: string;
  readonly retryable: boolean;
  readonly error?: string;
}

async function executeSingleCall(
  url: string,
  body: string,
  apiKey: string,
): Promise<SingleAttemptOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body,
      signal: controller.signal,
    });

    if (response.ok) {
      const json = (await response.json()) as GeminiResponse;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      return text
        ? { text, retryable: false }
        : { retryable: false, error: 'ai.error.empty_response' };
    }

    const isRetryable = response.status === 429 || response.status >= 500;
    return { retryable: isRetryable, error: `ai.error.http_${response.status}` };
  } catch {
    return { retryable: true, error: 'ai.error.network_or_timeout' };
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(params: GeminiCallParams): Promise<Result<string, string>> {
  const url = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL_ID}:generateContent`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: params.systemPrompt }] },
    contents: [{ parts: [{ text: params.prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: params.schema,
    },
  });

  const first = await executeSingleCall(url, body, params.apiKey);
  if (first.text) return ok(first.text);
  if (!first.retryable) return err(first.error ?? 'ai.error.unknown');

  await new Promise((resolve) => setTimeout(resolve, 500));
  const second = await executeSingleCall(url, body, params.apiKey);
  if (second.text) return ok(second.text);
  return err(second.error ?? 'ai.error.failed_after_retry');
}

/**
 * Cloud Gemini AI provider with strict privacy allowlist payload and numerical grounding checks.
 */
export const GeminiProvider: AiProvider = {
  id: 'gemini',

  async explainPlan(input: ExplainPlanInput): Promise<Result<AiExplanation, string>> {
    if (!input.apiKey || input.apiKey.trim().length === 0) {
      return err('ai.error.missing_api_key');
    }

    const schema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' },
        highlights: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['summary', 'highlights'],
    };

    const systemPrompt =
      'You are Saans Air Quality Copilot. Provide concise, protective guidance. Output words only; do not invent numbers.';
    const prompt = `Explain this air quality scenario and actions: ${JSON.stringify(input.payload)}`;

    const res = await callGemini({ prompt, systemPrompt, schema, apiKey: input.apiKey });
    if (!res.ok) return err(res.error);

    try {
      const parsed = AiExplanationSchema.parse(JSON.parse(res.value));
      const allowed = buildAllowedNumbers(input.payload);
      const okSummary = numbersAreGrounded(parsed.summary, allowed);
      const okHighlights = parsed.highlights.every((h) => numbersAreGrounded(h, allowed));

      if (!okSummary || !okHighlights) {
        return err('ai.error.ungrounded_numbers');
      }

      return ok({
        summary: parsed.summary,
        highlights: parsed.highlights,
      });
    } catch {
      return err('ai.error.schema_violation');
    }
  },

  async answerQuestion(input: AnswerQuestionInput): Promise<Result<AiAnswer, string>> {
    if (!input.apiKey || input.apiKey.trim().length === 0) {
      return err('ai.error.missing_api_key');
    }

    const schema = {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING' },
        suggestedActionId: { type: 'STRING' },
      },
      required: ['text'],
    };

    const systemPrompt =
      'You are Saans Air Quality Copilot. Answer user question safely. Output words only; do not invent numbers.';
    const prompt = `Context: ${JSON.stringify(input.payload)}\nUser Question: ${input.question}`;

    const res = await callGemini({ prompt, systemPrompt, schema, apiKey: input.apiKey });
    if (!res.ok) return err(res.error);

    try {
      const parsed = AiAnswerSchema.parse(JSON.parse(res.value));
      const allowed = buildAllowedNumbers(input.payload);
      if (!numbersAreGrounded(parsed.text, allowed)) {
        return err('ai.error.ungrounded_numbers');
      }
      return ok({
        text: parsed.text,
        suggestedActionId: parsed.suggestedActionId,
      });
    } catch {
      return err('ai.error.schema_violation');
    }
  },
};
