import type { SelectProps } from './props';

export type { SelectProps };

/**
 * Accessible HTML select dropdown wired with labels, helper text, and validation states.
 */
export function Select({
  id,
  label,
  hint,
  error,
  className = '',
  children,
  ...selectProps
}: SelectProps): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1 text-left ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-text-main">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="text-xs text-text-muted">
          {hint}
        </span>
      )}
      <select
        id={id}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`min-h-[44px] px-3 py-2 border rounded-lg bg-bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus ${
          error ? 'border-amber-dark' : 'border-border'
        }`}
        {...selectProps}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} role="alert" className="text-xs font-medium text-amber-dark">
          {error}
        </span>
      )}
    </div>
  );
}
