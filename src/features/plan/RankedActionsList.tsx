import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { Card } from '../../shared';
import type { ActionCategoryGroupViewModel, ActionItemViewModel } from './plan.types';

export interface RankedActionsListProps {
  readonly groups: readonly ActionCategoryGroupViewModel[];
  readonly isActionExpanded: (actionId: string) => boolean;
  readonly onToggleWhy: (actionId: string) => void;
  readonly lang: Language;
}

interface ActionCardProps {
  readonly action: ActionItemViewModel;
  readonly isExpanded: boolean;
  readonly onToggleWhy: (actionId: string) => void;
  readonly lang: Language;
}

function ActionCard({ action, isExpanded, onToggleWhy, lang }: ActionCardProps): JSX.Element {
  const whyId = `why-content-${action.id}`;
  const btnId = `why-toggle-${action.id}`;

  return (
    <div className="p-4 rounded-lg bg-bg-base border border-border flex flex-col gap-3 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-text-main">{action.title}</h4>
        <span
          className={`text-xs px-2.5 py-1 rounded font-medium self-start sm:self-auto ${
            action.isQualitative
              ? 'bg-amber-light text-amber-dark'
              : 'bg-teal-light text-teal-dark font-semibold'
          }`}
        >
          {action.impactLabel}
        </span>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">{action.description}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-muted">
            {action.effortLabel}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-muted">
            {action.costLabel}
          </span>
        </div>

        <button
          type="button"
          id={btnId}
          aria-expanded={isExpanded}
          aria-controls={whyId}
          onClick={() => onToggleWhy(action.id)}
          className="text-xs font-semibold text-teal hover:underline focus:outline-none focus:ring-1 focus:ring-teal rounded px-1 min-h-[32px] inline-flex items-center gap-1"
        >
          <span>{translate(lang, 'plan.action.why')}</span>
          <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {isExpanded && (
        <div
          id={whyId}
          role="region"
          aria-labelledby={btnId}
          className="p-3 bg-bg-elevated rounded border border-border/80 text-xs text-text-muted leading-relaxed mt-1"
        >
          <span className="font-semibold text-text-main mr-1">Mechanism:</span>
          {action.whyReason}
        </div>
      )}
    </div>
  );
}

/**
 * Displays prioritized air pollution mitigation actions grouped by category with expandable reasons.
 */
export function RankedActionsList({
  groups,
  isActionExpanded,
  onToggleWhy,
  lang,
}: RankedActionsListProps): JSX.Element {
  return (
    <Card className="flex flex-col gap-5">
      <div className="text-left flex flex-col gap-1">
        <h3 className="text-base font-bold text-text-main">
          {translate(lang, 'plan.actions.title')}
        </h3>
        <p className="text-xs text-text-muted">{translate(lang, 'plan.actions.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.category} className="flex flex-col gap-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border pb-1">
              {group.categoryLabel}
            </h4>
            <div className="flex flex-col gap-3">
              {group.actions.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  isExpanded={isActionExpanded(act.id)}
                  onToggleWhy={onToggleWhy}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
