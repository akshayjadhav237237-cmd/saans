import type { IconProps } from './props';

export type { IconProps };

/**
 * Standard inline SVG icon wrapper providing consistent dimensions and accessibility attributes.
 */
export function IconWrapper({
  className = '',
  size,
  label,
  children,
  'aria-hidden': ariaHidden,
  ...rest
}: IconProps): JSX.Element {
  const sizeStyle = size ? { width: size, height: size } : undefined;
  const isHidden = ariaHidden ?? (label ? undefined : true);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden={isHidden}
      aria-label={label}
      style={sizeStyle}
      className={`w-5 h-5 inline-block ${className}`.trim()}
    >
      {label && <title>{label}</title>}
      {children}
    </svg>
  );
}

/**
 * Air / Wind icon representing ventilation and outdoor atmosphere.
 */
export function WindIcon(props: IconProps): JSX.Element {
  return (
    <IconWrapper {...props}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </IconWrapper>
  );
}

/**
 * Shield checkmark icon representing verified filtration protection.
 */
export function ShieldIcon(props: IconProps): JSX.Element {
  return (
    <IconWrapper {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </IconWrapper>
  );
}

/**
 * Circle alert icon representing warnings and sensitivity thresholds.
 */
export function AlertIcon(props: IconProps): JSX.Element {
  return (
    <IconWrapper {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconWrapper>
  );
}
