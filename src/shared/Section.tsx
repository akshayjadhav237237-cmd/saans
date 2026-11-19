import type { SectionProps } from './props';

export type { SectionProps };

/** Accessible landmark section wrapper rendering structured level-2 headings and descriptions. */
export function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
  ...rest
}: SectionProps): JSX.Element {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`py-4 sm:py-6 flex flex-col gap-4 text-left ${className}`}
      {...rest}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-xl sm:text-2xl font-bold text-text-main">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
