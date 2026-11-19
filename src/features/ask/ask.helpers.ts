import { GeminiProvider } from '../../ai/gemini';
import type { AiAnswer, SanitizedPayload } from '../../ai/port';
import { answerWithFallback } from '../../ai/select';
import type { Clock, IdGen } from '../../domain/ports';
import type { TranslationKey } from '../../i18n';
import { buildPayloadFromState, type BuildPayloadStateInput } from './ask.viewmodel';

export interface QueryHistoryItem {
  readonly id: string;
  readonly question: string;
  readonly answer: AiAnswer;
  readonly isFallback: boolean;
  readonly timestamp: number;
}

export interface ExecuteQuestionInput {
  readonly question: string;
  readonly payload: SanitizedPayload;
  readonly apiKey: string;
}

export interface ExecuteQuestionResult {
  readonly answer: AiAnswer;
  readonly isFallback: boolean;
}

export interface HistoryPorts {
  readonly clock: Clock;
  readonly idGen: IdGen;
}

export interface ExecutedHistoryResult {
  readonly answer: AiAnswer;
  readonly isFallback: boolean;
  readonly item: QueryHistoryItem;
}

export interface AskActions {
  readonly clearError: () => void;
  readonly selectExample: (text: string) => void;
  readonly clearAnswer: () => void;
}

/** Executes question query targeting Gemini if API key is present with local fallback. */
export async function executeAiQuestion(
  input: ExecuteQuestionInput,
): Promise<ExecuteQuestionResult> {
  const hasKey = input.apiKey.trim().length > 0;
  if (hasKey) {
    const geminiRes = await GeminiProvider.answerQuestion({
      question: input.question,
      payload: input.payload,
      apiKey: input.apiKey.trim(),
    });
    if (geminiRes.ok) {
      return { answer: geminiRes.value, isFallback: false };
    }
    const fallbackAnswer = await answerWithFallback({
      question: input.question,
      payload: input.payload,
    });
    return { answer: fallbackAnswer, isFallback: true };
  }

  const localAnswer = await answerWithFallback({
    question: input.question,
    payload: input.payload,
  });
  return { answer: localAnswer, isFallback: false };
}

/** Executes sanitized question query and constructs query history item. */
export async function executeAndBuildHistory(
  question: string,
  apiKey: string,
  state: BuildPayloadStateInput,
  ports: HistoryPorts,
): Promise<ExecutedHistoryResult> {
  const payload = buildPayloadFromState(state);
  const res = await executeAiQuestion({ question, payload, apiKey });
  const item: QueryHistoryItem = {
    id: ports.idGen.nextId(),
    question,
    answer: res.answer,
    isFallback: res.isFallback,
    timestamp: ports.clock.now(),
  };
  return { answer: res.answer, isFallback: res.isFallback, item };
}

/** Creates UI reset and selection actions for the Ask panel. */
export function createAskActions(
  setError: (e: TranslationKey | null) => void,
  setQuestion: (q: string) => void,
  setAnswer: (a: AiAnswer | null) => void,
  setIsFallback: (f: boolean) => void,
): AskActions {
  return {
    clearError: () => setError(null),
    selectExample: (t: string) => {
      setQuestion(t);
      setError(null);
    },
    clearAnswer: () => {
      setAnswer(null);
      setIsFallback(false);
    },
  };
}
