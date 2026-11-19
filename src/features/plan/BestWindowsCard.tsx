import type { HourlySeries } from '../../domain/types';
import type { Language } from '../../i18n';
import { translate } from '../../i18n';
import { Card, Chart } from '../../shared';
import type { BestWindowViewModel } from './plan.types';

export interface BestWindowsCardProps {
  readonly windows: readonly BestWindowViewModel[];
  readonly hourly: HourlySeries;
  readonly lang: Language;
}

/**
 * Renders optimal low-exposure daily time windows and the diurnal air pollution line chart.
 */
export function BestWindowsCard({ windows, hourly, lang }: BestWindowsCardProps): JSX.Element {
  return (
    <Card className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-text-main">
          {translate(lang, 'plan.windows.title')}
        </h3>
        <p className="text-xs text-text-muted">{translate(lang, 'plan.windows.subtitle')}</p>
      </div>

      {/* Recommended Windows List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {windows.map((w, index) => (
          <div
            key={`${w.startHour}-${w.endHour}-${index}`}
            className="p-3.5 rounded-lg bg-bg-base border border-border flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-dark font-mono">
                {w.timeRangeFormatted}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-elevated border border-border font-mono text-text-main">
                {w.avgFormatted}
              </span>
            </div>
            <span className="text-xs text-text-muted">{w.label}</span>
          </div>
        ))}
      </div>

      {/* Diurnal Trend Chart with Data Table Toggle */}
      <div className="pt-2 border-t border-border/60">
        <Chart
          hourly={hourly}
          title="24-Hour Diurnal PM2.5 Forecast"
          description="Diurnal variation of particulate matter with optimal low-exposure windows"
        />
      </div>
    </Card>
  );
}
