import type { BandBadgeProps } from './props';

export type { BandBadgeProps };

const BAND_CONFIG = {
  good: {
    bg: 'bg-teal-light text-teal-dark border-teal',
    shape: 'circle',
  },
  moderate: {
    bg: 'bg-amber-light text-amber-dark border-amber-dark',
    shape: 'diamond',
  },
  unhealthy_sensitive: {
    bg: 'bg-amber-light text-amber-dark border-amber-dark',
    shape: 'triangle',
  },
  unhealthy: {
    bg: 'bg-amber-light text-amber-dark border-amber-dark',
    shape: 'square',
  },
  very_unhealthy: {
    bg: 'bg-amber-light text-amber-dark border-amber-dark',
    shape: 'pentagon',
  },
  hazardous: {
    bg: 'bg-amber-light text-amber-dark border-amber-dark',
    shape: 'octagon',
  },
} as const;

function renderShape(shape: string): JSX.Element {
  switch (shape) {
    case 'circle':
      return <circle cx="6" cy="6" r="4" fill="currentColor" />;
    case 'diamond':
      return <polygon points="6,1 11,6 6,11 1,6" fill="currentColor" />;
    case 'triangle':
      return <polygon points="6,2 11,10 1,10" fill="currentColor" />;
    case 'square':
      return <rect x="2" y="2" width="8" height="8" fill="currentColor" />;
    case 'pentagon':
      return <polygon points="6,1 11,5 9,11 3,11 1,5" fill="currentColor" />;
    default:
      return <polygon points="4,1 8,1 11,4 11,8 8,11 4,11 1,8 1,4" fill="currentColor" />;
  }
}

/**
 * Accessible Air Quality category indicator combining high-contrast colors, text, and unique geometric shapes.
 */
export function BandBadge({ band, label, className = '' }: BandBadgeProps): JSX.Element {
  const config = BAND_CONFIG[band];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${config.bg} ${className}`}
    >
      <svg
        className="w-3 h-3 flex-shrink-0"
        viewBox="0 0 12 12"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape(config.shape)}
      </svg>
      <span>{label}</span>
    </span>
  );
}
