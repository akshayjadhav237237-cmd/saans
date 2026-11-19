import { useAppStore } from '../../state/store';
import { translate } from '../../i18n';
import { Toggle } from '../../shared/Toggle';
import { Field } from '../../shared/Field';
import { Button } from '../../shared/Button';

export interface ManualPm25SectionProps {
  readonly isOpen: boolean;
  readonly onToggle: (open: boolean) => void;
  readonly value: string;
  readonly onChangeValue: (value: string) => void;
  readonly onSubmit: () => boolean;
  readonly error: string | null;
}

/**
 * Collapsible section allowing manual PM2.5 data entry for offline and field scenarios.
 */
export function ManualPm25Section({
  isOpen,
  onToggle,
  value,
  onChangeValue,
  onSubmit,
  error,
}: ManualPm25SectionProps): JSX.Element {
  const language = useAppStore((s) => s.language);

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-border">
      <Toggle
        id="manual-pm25-toggle"
        label={translate(language, 'location.manual.toggle')}
        checked={isOpen}
        onChange={onToggle}
      />

      {isOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 bg-bg-surface rounded-lg border border-border"
        >
          <Field
            id="manual-pm25-input"
            label={translate(language, 'location.manual.label')}
            type="number"
            min="0"
            max="1000"
            step="1"
            value={value}
            onChange={(e) => onChangeValue(e.target.value)}
            error={error ?? undefined}
            className="w-full sm:w-48"
          />
          <Button type="submit" variant="primary">
            {translate(language, 'location.manual.apply')}
          </Button>
        </form>
      )}
    </div>
  );
}
