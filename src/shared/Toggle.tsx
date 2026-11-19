import type { ToggleProps } from './props';

export type { ToggleProps };

/**
 * Accessible binary toggle switch meeting ARIA switch pattern and minimum touch target requirements.
 */
export function Toggle({
  id,
  label,
  checked,
  onChange,
  hint,
  className = '',
}: ToggleProps): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
      <div className="flex flex-col text-left">
        <label htmlFor={id} className="text-sm font-medium text-text-main cursor-pointer">
          {label}
        </label>
        {hint && (
          <span id={hintId} className="text-xs text-text-muted">
            {hint}
          </span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hintId}
        onClick={() => onChange(!checked)}
        className={`min-h-[44px] min-w-[56px] relative inline-flex items-center rounded-full px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 ${
          checked ? 'bg-teal' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block w-6 h-6 transform bg-bg-surface rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
