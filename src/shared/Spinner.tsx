import type { SpinnerProps } from './props';
import { VisuallyHidden } from './VisuallyHidden';

export type { SpinnerProps };

/** Accessible loading indicator that gracefully respects system prefers-reduced-motion settings. */
export function Spinner({ label = 'Loading...', className = '' }: SpinnerProps): JSX.Element {
  return (
    <div role="status" className={`inline-flex items-center justify-center p-2 ${className}`}>
      <svg
        className="w-6 h-6 text-teal motion-safe:animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  );
}
