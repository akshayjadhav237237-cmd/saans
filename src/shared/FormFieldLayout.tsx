import type { FormFieldLayoutProps, FormFieldRenderProp } from './props';

export type { FormFieldLayoutProps, FormFieldRenderProp };

/** Returns standard form control styling based on validation state. */
export function getFieldControlClass(error?: string): string {
  return `min-h-[44px] px-3 py-2 border rounded-lg bg-bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus ${
    error ? 'border-amber-dark' : 'border-border'
  }`;
}

/** Accessible field wrapper layout wiring labels, hints, and error messages. */
export function FormFieldLayout({
  id,
  label,
  hint,
  error,
  className = '',
  children,
}: FormFieldLayoutProps): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const content = typeof children === 'function' ? children(describedBy) : children;

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
      {content}
      {error && (
        <span id={errorId} role="alert" className="text-xs font-medium text-amber-dark">
          {error}
        </span>
      )}
    </div>
  );
}
