import { useCallback, useMemo, useState } from 'react';
import { validateAndSanitizeQuestion } from '../../ai/guard';
import type { AiAnswer } from '../../ai/port';
import { createCounterIdGen, createSystemClock, type Clock, type IdGen } from '../../domain/ports';
import type { TranslationKey } from '../../i18n';
import { useAppStore } from '../../state/store';
import { createAskActions, executeAndBuildHistory, type QueryHistoryItem } from './ask.helpers';
import { getProviderMode, isCharacterLimitExceeded, type ProviderMode } from './ask.viewmodel';

export interface UseAskOptions {
  readonly initialQuestion?: string;
  readonly clock?: Clock;
  readonly idGen?: IdGen;
}

export interface UseAskResult {
  readonly question: string;
  readonly setQuestion: (question: string) => void;
  readonly answer: AiAnswer | null;
  readonly history: readonly QueryHistoryItem[];
  readonly isLoading: boolean;
  readonly error: TranslationKey | null;
  readonly isFallback: boolean;
  readonly charCount: number;
  readonly isOverLimit: boolean;
  readonly apiKey: string;
  readonly setApiKey: (key: string) => void;
  readonly clearApiKey: () => void;
  readonly mode: ProviderMode;
  readonly askQuestion: (overrideQuestion?: string) => Promise<void>;
  readonly clearError: () => void;
  readonly selectExample: (exampleText: string) => void;
  readonly clearAnswer: () => void;
}

const DEFAULT_CLOCK: Clock = createSystemClock();
const DEFAULT_ID_GEN: IdGen = createCounterIdGen('ask');

/** React view-model hook managing Ask Saans question input, validation, and AI responses. */
export function useAsk(options: UseAskOptions = {}): UseAskResult {
  const clock = options.clock ?? DEFAULT_CLOCK;
  const idGen = options.idGen ?? DEFAULT_ID_GEN;
  const [question, setQuestion] = useState(options.initialQuestion ?? '');
  const [answer, setAnswer] = useState<AiAnswer | null>(null);
  const [history, setHistory] = useState<readonly QueryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const { language, airData, profile, plan, aiKey, setAiKey, clearAiKey } = useAppStore();
  const mode = useMemo(() => getProviderMode(aiKey), [aiKey]);
  const isOverLimit = useMemo(() => isCharacterLimitExceeded(question.length), [question.length]);
  const actions = useMemo(
    () => createAskActions(setError, setQuestion, setAnswer, setIsFallback),
    [],
  );

  const askQuestion = useCallback(
    async (override?: string): Promise<void> => {
      const v = validateAndSanitizeQuestion(override ?? question);
      if (!v.ok) {
        setError(v.error as TranslationKey);
        return;
      }
      setIsLoading(true);
      setError(null);
      const res = await executeAndBuildHistory(
        v.value,
        aiKey,
        { profile, language, airData, plan },
        { clock, idGen },
      );
      setAnswer(res.answer);
      setIsFallback(res.isFallback);
      setHistory((prev) => [...prev, res.item]);
      setIsLoading(false);
    },
    [question, aiKey, profile, language, airData, plan, clock, idGen],
  );

  return {
    question,
    setQuestion,
    answer,
    history,
    isLoading,
    error,
    isFallback,
    charCount: question.length,
    isOverLimit,
    apiKey: aiKey,
    setApiKey: setAiKey,
    clearApiKey: clearAiKey,
    mode,
    askQuestion,
    ...actions,
  };
}
