import type { CardProps } from './props';

export type { CardProps };

/**
 * Standard container card component providing surface contrast and elevated border styling.
 */
export function Card({ children, className = '', ...rest }: CardProps): JSX.Element {
  return (
    <div
      className={`bg-bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
