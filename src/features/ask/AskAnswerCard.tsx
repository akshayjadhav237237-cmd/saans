import type { AiAnswer } from '../../ai/port';
import type { Language, TranslationKey } from '../../i18n';
import { translate } from '../../i18n';
import { Card, Notice } from '../../shared';

export interface AskAnswerCardProps {
  readonly answer: AiAnswer;
  readonly isFallback: boolean;
  readonly language: Language;
}

/** Renders the AI answer card with suggested action chip and fallback warning notice. */
export function AskAnswerCard({ answer, isFallback, language }: AskAnswerCardProps): JSX.Element {
  const actionKey = answer.suggestedActionId
    ? (`action.${answer.suggestedActionId}.title` as TranslationKey)
    : undefined;
  const actionTitle = actionKey ? translate(language, actionKey) : undefined;

  return (
    <Card className="mt-4 border-l-4 border-teal flex flex-col gap-3">
      {isFallback && (
        <Notice variant="warning">{translate(language, 'ask.fallback_notice')}</Notice>
      )}
      <div className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
        {answer.text}
      </div>
      {actionTitle && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-text-muted">
            {translate(language, 'plan.action.why')}:
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-light text-teal-dark border border-teal">
            {actionTitle}
          </span>
        </div>
      )}
    </Card>
  );
}
