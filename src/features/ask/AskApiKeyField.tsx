import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { Button, Field } from '../../shared';

export interface AskApiKeyFieldProps {
  readonly apiKey: string;
  readonly language: Language;
  readonly onApiKeyChange: (key: string) => void;
  readonly onClearApiKey: () => void;
}

/** Renders the optional Gemini API key password input and clear button. */
export function AskApiKeyField({
  apiKey,
  language,
  onApiKeyChange,
  onClearApiKey,
}: AskApiKeyFieldProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
      <Field
        id="gemini-api-key"
        type="password"
        label={translate(language, 'ask.key.label')}
        placeholder={translate(language, 'ask.key.placeholder')}
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="flex-1 w-full"
      />
      {apiKey.length > 0 && (
        <Button variant="secondary" onClick={onClearApiKey} type="button">
          {translate(language, 'ask.key.clear')}
        </Button>
      )}
    </div>
  );
}
