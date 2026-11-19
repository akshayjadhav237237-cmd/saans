import { useAppStore } from '../../state/store';
import { translate } from '../../i18n';
import { Card } from '../../shared/Card';
import { BandBadge } from '../../shared/BandBadge';
import { Spinner } from '../../shared/Spinner';
import { Notice } from '../../shared/Notice';
import { Button } from '../../shared/Button';
import type { LocationDisplayModel } from './location.viewmodel';

export interface LiveAqiCardProps {
  readonly model: LocationDisplayModel | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onRetry?: () => void;
}

interface MetricBlockProps {
  readonly label: string;
  readonly value: number;
  readonly unit?: string;
}

function MetricBlock({ label, value, unit }: MetricBlockProps): JSX.Element {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-bg-base border border-border">
      <span className="text-xs font-semibold uppercase text-text-muted">{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-4xl font-extrabold text-text-main">{value}</span>
        {unit && <span className="text-sm font-medium text-text-muted">{unit}</span>}
      </div>
    </div>
  );
}

/** Visualizes current ambient air quality metrics, category band badge, and data attribution. */
export function LiveAqiCard({ model, isLoading, error, onRetry }: LiveAqiCardProps): JSX.Element {
  const language = useAppStore((s) => s.language);

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <Spinner label="Loading air quality..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col gap-3 p-6">
        <Notice variant="warning">
          <span>{translate(language, 'location.error.fetch')}</span>
        </Notice>
        {onRetry && (
          <div>
            <Button variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (!model) {
    return (
      <Card className="p-6 text-center text-text-muted">
        <p>No air quality data available. Please select a city.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-xl font-bold text-text-main">{model.cityName}</h3>
          <p className="text-xs text-text-muted">{model.fullLocationName}</p>
        </div>
        <BandBadge band={model.aqiBand} label={translate(language, model.aqiBandLabelKey)} />
      </div>

      {model.isManual && (
        <Notice variant="info">{translate(language, 'location.manual.notice')}</Notice>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <MetricBlock label={translate(language, 'location.card.us_aqi')} value={model.aqi} />
        <MetricBlock
          label={translate(language, 'location.card.pm25')}
          value={model.pm25}
          unit={translate(language, 'location.card.unit')}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-text-muted pt-2 border-t border-border">
        <span>{translate(language, 'location.card.updated')}</span>
        <span>{model.attribution}</span>
      </div>
    </Card>
  );
}
