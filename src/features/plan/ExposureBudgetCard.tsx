import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { BandBadge, Card } from '../../shared';
import { mapRiskToAqiBand } from './plan.format';
import type { ExposureComparisonViewModel, MemberExposureViewModel } from './plan.types';

export interface ExposureBudgetCardProps {
  readonly comparison: ExposureComparisonViewModel;
  readonly members: readonly MemberExposureViewModel[];
  readonly lang: Language;
}

function ComparisonColumns({
  comparison,
  lang,
}: {
  readonly comparison: ExposureComparisonViewModel;
  readonly lang: Language;
}): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-bg-base border border-border flex flex-col gap-2 text-left">
        <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
          {translate(lang, 'plan.baseline.title')}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main font-mono">
            {comparison.baseline.doseUg}
          </span>
          <span className="text-xs text-text-muted">{translate(lang, 'plan.dose.unit')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-semibold text-text-main font-mono">
            ~{comparison.baseline.cigEq}
          </span>
          <span>{translate(lang, 'plan.cig.per_day')}</span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-teal-light/20 border border-teal/40 flex flex-col gap-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-teal-dark">
            {translate(lang, 'plan.optimized.title')}
          </span>
          {comparison.deltaPercent > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal text-text-inverse">
              -{comparison.deltaPercent}%
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-dark font-mono">
            {comparison.optimized.doseUg}
          </span>
          <span className="text-xs text-text-muted">{translate(lang, 'plan.dose.unit')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-semibold text-teal-dark font-mono">
            ~{comparison.optimized.cigEq}
          </span>
          <span>{translate(lang, 'plan.cig.per_day')}</span>
        </div>
      </div>
    </div>
  );
}

function MembersRiskTable({
  members,
  lang,
}: {
  readonly members: readonly MemberExposureViewModel[];
  readonly lang: Language;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-3 text-left">
      <h3 className="text-sm font-semibold text-text-main">{translate(lang, 'plan.risk.label')}</h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">{translate(lang, 'plan.risk.label')}</caption>
          <thead className="bg-bg-elevated border-b border-border text-text-muted">
            <tr>
              <th scope="col" className="p-2.5">
                Member
              </th>
              <th scope="col" className="p-2.5">
                Baseline Risk
              </th>
              <th scope="col" className="p-2.5">
                Projected Risk
              </th>
              <th scope="col" className="p-2.5 text-right">
                Dose Reduction
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const diff = Math.max(0, m.baselineDoseUg - m.optimizedDoseUg);
              return (
                <tr key={m.memberId} className="border-b border-border/50">
                  <td className="p-2.5 font-medium text-text-main">
                    {m.roleLabel}
                    {m.hasCondition && (
                      <span className="ml-1.5 text-[10px] text-amber-dark font-normal">
                        (sensitive)
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <BandBadge
                      band={mapRiskToAqiBand(m.baselineRiskBand)}
                      label={m.baselineRiskBandLabel}
                    />
                  </td>
                  <td className="p-2.5">
                    <BandBadge
                      band={mapRiskToAqiBand(m.optimizedRiskBand)}
                      label={m.optimizedRiskBandLabel}
                    />
                  </td>
                  <td className="p-2.5 text-right font-mono text-teal-dark">-{diff} ug</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Renders the daily inhaled PM2.5 dosage and cigarette equivalence comparison with member risk tiers. */
export function ExposureBudgetCard({
  comparison,
  members,
  lang,
}: ExposureBudgetCardProps): JSX.Element {
  return (
    <Card className="flex flex-col gap-6">
      <ComparisonColumns comparison={comparison} lang={lang} />
      <p className="text-xs text-text-muted italic border-l-2 border-border pl-3 text-left">
        {comparison.disclaimer}
      </p>
      <MembersRiskTable members={members} lang={lang} />
    </Card>
  );
}
