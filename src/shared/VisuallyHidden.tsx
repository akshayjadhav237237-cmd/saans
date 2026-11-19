import type { VisuallyHiddenProps } from './props';

export type { VisuallyHiddenProps };

/** Screen-reader only utility component keeping essential labels accessible without visual rendering. */
export function VisuallyHidden({
  children,
  className = '',
  ...rest
}: VisuallyHiddenProps): JSX.Element {
  return (
    <span
      className={`sr-only absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 border-0 whitespace-nowrap ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
