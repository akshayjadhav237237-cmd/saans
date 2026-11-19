import type { NoticeProps } from './props';

export type { NoticeProps };

const NOTICE_STYLES = {
  info: 'bg-teal-light text-teal-dark border-teal',
  warning: 'bg-amber-light text-amber-dark border-amber-dark',
  success: 'bg-teal-light text-teal-dark border-teal',
} as const;

/** Accessible polite status notice component announcing updates to assistive screen-reading technologies. */
export function Notice({
  variant = 'info',
  children,
  className = '',
  ...rest
}: NoticeProps): JSX.Element {
  const style = NOTICE_STYLES[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-3 border-l-4 rounded-r-lg text-sm font-medium ${style} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
