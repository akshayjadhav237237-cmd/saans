import type { FieldProps } from './props';
import { FormFieldLayout, getFieldControlClass } from './FormFieldLayout';

export type { FieldProps };

/** Accessible form field wrapper wiring input labels, hints, and error states with ARIA attributes. */
export function Field({
  id,
  label,
  hint,
  error,
  className = '',
  children,
  ...inputProps
}: FieldProps): JSX.Element {
  return (
    <FormFieldLayout id={id} label={label} hint={hint} error={error} className={className}>
      {(describedBy) =>
        children ?? (
          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={getFieldControlClass(error)}
            {...inputProps}
          />
        )
      }
    </FormFieldLayout>
  );
}
