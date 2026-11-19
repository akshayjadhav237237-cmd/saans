import type { SelectProps } from './props';
import { FormFieldLayout, getFieldControlClass } from './FormFieldLayout';

export type { SelectProps };

/** Accessible HTML select dropdown wired with labels, helper text, and validation states. */
export function Select({
  id,
  label,
  hint,
  error,
  className = '',
  children,
  ...selectProps
}: SelectProps): JSX.Element {
  return (
    <FormFieldLayout id={id} label={label} hint={hint} error={error} className={className}>
      {(describedBy) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={getFieldControlClass(error)}
          {...selectProps}
        >
          {children}
        </select>
      )}
    </FormFieldLayout>
  );
}
