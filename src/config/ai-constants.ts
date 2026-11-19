/** Request timeout in milliseconds for Gemini API calls. */
export const TIMEOUT_MS = 15000;

/** Retry delay in milliseconds for transient failures. */
export const AI_RETRY_DELAY_MS = 500;

/** Temperature parameter for deterministic response generation. */
export const AI_TEMPERATURE = 0.1;

/** System instruction for plan explanations. */
export const EXPLAIN_SYSTEM_PROMPT =
  'You are Saans Air Quality Copilot. Provide concise, protective guidance. Output words only; do not invent numbers.';

/** System instruction for question answering. */
export const QA_SYSTEM_PROMPT =
  'You are Saans Air Quality Copilot. Answer user question safely. Output words only; do not invent numbers.';

/** Gemini JSON schema definition for plan explanation responses. */
export const EXPLAIN_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    highlights: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['summary', 'highlights'],
} as const;

/** Gemini JSON schema definition for question answering responses. */
export const QA_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    text: { type: 'STRING' },
    suggestedActionId: { type: 'STRING' },
  },
  required: ['text'],
} as const;
