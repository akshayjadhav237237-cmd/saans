import type { ButtonProps } from './props';

export type { ButtonProps };

const VARIANT_CLASSES = {
  primary: 'bg-teal text-text-inverse hover:bg-teal-dark active:bg-teal-dark font-medium',
  secondary:
    'bg-bg-elevated text-text-main border border-border hover:bg-bg-surface active:bg-bg-surface font-medium',
  ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-bg-elevated',
} as const;

/** Accessible interactive button component meeting minimum 44px touch targets. */
export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps): JSX.Element {
  const variantClass = VARIANT_CLASSES[variant];

  return (
    <button
      className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
