import { translate } from '../../i18n';
import { Section } from '../../shared';
import { useAppStore } from '../../state/store';
import { AskAnswerCard } from './AskAnswerCard';
import { AskApiKeyField } from './AskApiKeyField';
import { AskDisclosure } from './AskDisclosure';
import { AskExampleChips } from './AskExampleChips';
import { AskQuestionForm } from './AskQuestionForm';
import { formatCharacterCount, getExampleQuestions, getProviderModeLabel } from './ask.viewmodel';
import { useAsk } from './useAsk';

export interface AskPanelProps {
  readonly className?: string;
}

/** Primary Ask Saans copilot panel providing privacy-first air quality advice. */
export function AskPanel({ className = '' }: AskPanelProps): JSX.Element {
  const {
    question,
    setQuestion,
    answer,
    isLoading,
    error,
    isFallback,
    charCount,
    isOverLimit,
    apiKey,
    setApiKey,
    clearApiKey,
    mode,
    askQuestion,
    selectExample,
  } = useAsk();

  const language = useAppStore((s) => s.language);
  const examples = getExampleQuestions(language);
  const modeLabel = getProviderModeLabel(apiKey, language);
  const counterText = formatCharacterCount(charCount, language);
  const errorMessage = error ? translate(language, error) : undefined;

  return (
    <Section
      id="ask-panel"
      title={translate(language, 'ask.title')}
      subtitle={translate(language, 'ask.subtitle')}
      className={className}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            data-testid="mode-badge"
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              mode === 'gemini'
                ? 'bg-teal-light text-teal-dark border border-teal'
                : 'bg-bg-elevated text-text-muted border border-border'
            }`}
          >
            {modeLabel}
          </span>
        </div>

        <AskApiKeyField
          apiKey={apiKey}
          language={language}
          onApiKeyChange={setApiKey}
          onClearApiKey={clearApiKey}
        />

        <AskDisclosure language={language} />

        <AskExampleChips
          examples={examples}
          label={translate(language, 'ask.examples.label')}
          onSelect={selectExample}
        />

        <AskQuestionForm
          question={question}
          errorMessage={errorMessage}
          counterText={counterText}
          isOverLimit={isOverLimit}
          isLoading={isLoading}
          language={language}
          onQuestionChange={setQuestion}
          onSubmit={() => {
            void askQuestion();
          }}
        />

        {answer && <AskAnswerCard answer={answer} isFallback={isFallback} language={language} />}
      </div>
    </Section>
  );
}
