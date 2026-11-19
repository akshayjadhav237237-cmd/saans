import { A11Y_NAMES } from './a11y-names';
import type { SkipLinkProps } from './props';

export type { SkipLinkProps };

/**
 * Accessible keyboard navigation skip link allowing users to bypass repetitive header navigation.
 */
export function SkipLink({
  targetId = 'main-content',
  label = A11Y_NAMES.skipLink,
}: SkipLinkProps): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal focus:text-text-inverse focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-border-focus"
    >
      {label}
    </a>
  );
}
