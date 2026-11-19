import React, { useCallback } from 'react';
import { translate } from '../../i18n';
import { BandBadge, Button, Card, Section } from '../../shared';
import { A11Y_NAMES } from '../../shared/a11y-names';
import { useAppStore } from '../../state/store';
import { CommunityActionsCard } from './CommunityActionsCard';
import { CommunitySchoolCard } from './CommunitySchoolCard';
import { useCommunity, type UseCommunityOptions } from './useCommunity';

export interface CommunityPanelProps {
  readonly overrides?: UseCommunityOptions;
  readonly className?: string;
}

/**
 * Accessible institutional air advisory panel displaying school thresholds and collective civic actions.
 */
export function CommunityPanel({
  overrides,
  className = '',
}: CommunityPanelProps = {}): React.JSX.Element {
  const language = useAppStore((state) => state.language);
  const { city, aqi, band, bandLabel, headline, advice, schoolStatus, actions } =
    useCommunity(overrides);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  return (
    <Section
      id="community-advisory"
      title={translate(language, 'community.title')}
      subtitle={translate(language, 'community.subtitle')}
      className={`print:py-0 print:gap-3 ${className}`}
    >
      <Card className="print:p-3 print:shadow-none print:border-gray-300">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {city}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-text-main mt-0.5">{headline}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-main" aria-label={`US AQI ${aqi}`}>
              AQI {aqi}
            </span>
            <BandBadge band={band} label={bandLabel} />
            <Button
              variant="secondary"
              onClick={handlePrint}
              aria-label={A11Y_NAMES.buttons.printAdvisory}
              className="print:hidden text-xs"
            >
              {A11Y_NAMES.buttons.printAdvisory}
            </Button>
          </div>
        </div>
        <p className="text-sm text-text-muted mt-3 leading-relaxed">{advice}</p>
      </Card>

      <CommunitySchoolCard
        schoolStatus={schoolStatus}
        statusHeading={translate(language, 'community.school.status')}
      />

      <CommunityActionsCard
        title={translate(language, 'community.actions.title')}
        actions={actions}
      />
    </Section>
  );
}
