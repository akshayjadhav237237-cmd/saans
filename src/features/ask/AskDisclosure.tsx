import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { getDisclosureList } from './ask.viewmodel';

export interface AskDisclosureProps {
  readonly language: Language;
}

/** Renders expandable data disclosure allowlist explaining fields transmitted to cloud. */
export function AskDisclosure({ language }: AskDisclosureProps): JSX.Element {
  const disclosures = getDisclosureList(language);

  return (
    <details className="group border border-border rounded-lg p-3 bg-bg-surface text-sm">
      <summary className="cursor-pointer font-medium text-text-main flex items-center justify-between">
        <span>{translate(language, 'ask.disclosure.toggle')}</span>
        <span className="text-xs text-text-muted group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="mt-3 space-y-2">
        <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
          {translate(language, 'ask.disclosure.title')}
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-xs text-text-muted">
          {disclosures.map((d) => (
            <li key={d.field}>
              <span className="font-mono text-text-main">{d.field}</span>: {d.description}
            </li>
          ))}
        </ul>
        <p className="text-xs font-medium text-teal-dark mt-2">
          {translate(language, 'ask.disclosure.notice')}
        </p>
      </div>
    </details>
  );
}
