import type { Result } from '../domain/result';

export interface SanitizedActionPayload {
  readonly id: string;
  readonly deltaPercent: number;
}

export interface SanitizedPayload {
  readonly aqiBandKey: string;
  readonly roundedPm25: number;
  readonly memberKinds: readonly ('child' | 'adult' | 'elder')[];
  readonly actions: readonly SanitizedActionPayload[];
  readonly language: 'en' | 'hi';
}

export interface AiExplanation {
  readonly summary: string;
  readonly highlights: readonly string[];
}

export interface AiAnswer {
  readonly text: string;
  readonly suggestedActionId?: string | undefined;
}

export interface ExplainPlanInput {
  readonly payload: SanitizedPayload;
  readonly apiKey?: string;
}

export interface AnswerQuestionInput {
  readonly question: string;
  readonly payload: SanitizedPayload;
  readonly apiKey?: string;
}

export interface AiProvider {
  readonly id: string;
  readonly explainPlan: (input: ExplainPlanInput) => Promise<Result<AiExplanation, string>>;
  readonly answerQuestion: (input: AnswerQuestionInput) => Promise<Result<AiAnswer, string>>;
}
