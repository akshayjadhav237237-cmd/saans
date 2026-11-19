import type { FormEvent } from 'react';
import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { Button, Field, Spinner } from '../../shared';

export interface AskQuestionFormProps {
  readonly question: string;
  readonly errorMessage?: string | undefined;
  readonly counterText: string;
  readonly isOverLimit: boolean;
  readonly isLoading: boolean;
  readonly language: Language;
  readonly onQuestionChange: (q: string) => void;
  readonly onSubmit: () => void;
}

/** Renders the question input field, character counter, and submit button. */
export function AskQuestionForm({
  question,
  errorMessage,
  counterText,
  isOverLimit,
  isLoading,
  language,
  onQuestionChange,
  onSubmit,
}: AskQuestionFormProps): JSX.Element {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Field
        id="ask-question-input"
        label={translate(language, 'ask.input.label')}
        placeholder={translate(language, 'ask.input.placeholder')}
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        error={errorMessage}
      />

      <p className="text-xs text-text-muted" data-testid="ask-privacy-notice">
        {translate(language, 'ask.input.privacy_hint')}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${isOverLimit ? 'text-amber-dark font-bold' : 'text-text-muted'}`}
        >
          {counterText}
        </span>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || question.trim().length === 0 || isOverLimit}
        >
          {isLoading ? (
            <Spinner label={translate(language, 'ask.loading')} />
          ) : (
            translate(language, 'ask.send')
          )}
        </Button>
      </div>
    </form>
  );
}
