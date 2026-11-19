import { GeminiProvider } from './gemini';
import { LocalProvider } from './local';
import type {
  AiAnswer,
  AiExplanation,
  AiProvider,
  AnswerQuestionInput,
  ExplainPlanInput,
} from './port';

/**
 * Selects the appropriate AI provider based on available credentials.
 */
export function selectProvider(apiKey?: string): AiProvider {
  if (apiKey && apiKey.trim().length > 0) {
    return GeminiProvider;
  }
  return LocalProvider;
}

/**
 * Explains an action plan with seamless fallback to deterministic local templates.
 */
export async function explainWithFallback(input: ExplainPlanInput): Promise<AiExplanation> {
  if (input.apiKey && input.apiKey.trim().length > 0) {
    const geminiRes = await GeminiProvider.explainPlan(input);
    if (geminiRes.ok) {
      return geminiRes.value;
    }
  }

  const localRes = await LocalProvider.explainPlan(input);
  return localRes.ok
    ? localRes.value
    : {
        summary: 'Your plan minimizes high-exposure hours.',
        highlights: ['Seal doors', 'Wear N95', 'Use purifier'],
      };
}

/**
 * Answers a user question with seamless fallback to local intent matching.
 */
export async function answerWithFallback(input: AnswerQuestionInput): Promise<AiAnswer> {
  if (input.apiKey && input.apiKey.trim().length > 0) {
    const geminiRes = await GeminiProvider.answerQuestion(input);
    if (geminiRes.ok) {
      return geminiRes.value;
    }
  }

  const localRes = await LocalProvider.answerQuestion(input);
  return localRes.ok
    ? localRes.value
    : {
        text: 'During severe winter smog episodes, keep indoor air purified and use N95 respirators outdoors.',
      };
}
