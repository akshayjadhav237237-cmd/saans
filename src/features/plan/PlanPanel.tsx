import { useState } from 'react';
import { createCounterIdGen, createSystemClock, type Clock } from '../../domain/ports';
import type { DayPlan } from '../../domain/types';
import { generateIcsCalendar, generateTextPlan } from '../../exports';
import { translate } from '../../i18n';
import { A11Y_NAMES, Button, Card, Notice, Section, Spinner } from '../../shared';
import { useAppStore } from '../../state/store';
import { BestWindowsCard } from './BestWindowsCard';
import { ExposureBudgetCard } from './ExposureBudgetCard';
import { RankedActionsList } from './RankedActionsList';
import { usePlan } from './usePlan';

export interface PlanPanelProps {
  readonly clock?: Clock | undefined;
  readonly onNavigateTab?: ((tab: 'location' | 'household') => void) | undefined;
}

interface ExportBarProps {
  readonly plan: DayPlan;
  readonly clock?: Clock | undefined;
}

function PlanExportBar({ plan, clock }: ExportBarProps): JSX.Element {
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const language = useAppStore((s) => s.language);
  const profile = useAppStore((s) => s.profile);
  const selectedCity = useAppStore((s) => s.selectedCity);

  const handleDownloadIcs = () => {
    const res = generateIcsCalendar({
      clock: clock ?? createSystemClock(),
      idGen: createCounterIdGen('cal'),
      plan,
      language,
      cityName: selectedCity?.name,
    });
    const blob = new Blob([res.content], { type: res.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    const res = generateTextPlan({
      plan,
      language,
      profile,
      cityName: selectedCity?.name,
    });
    if (typeof navigator !== 'undefined') {
      await navigator.clipboard?.writeText(res.content);
      setCopyNotice(translate(language, 'export.text.copied'));
      setTimeout(() => setCopyNotice(null), 3000);
    }
  };

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4 print:hidden">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleDownloadIcs}
          aria-label={A11Y_NAMES.buttons.downloadIcs}
        >
          {translate(language, 'export.ics.button')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCopyText}
          aria-label={A11Y_NAMES.buttons.copyPlan}
        >
          {translate(language, 'export.text.button')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.print?.()}
          aria-label={A11Y_NAMES.buttons.printAdvisory}
        >
          {translate(language, 'export.print.button')}
        </Button>
      </div>
      {copyNotice && (
        <span role="status" className="text-sm font-medium text-teal">
          {copyNotice}
        </span>
      )}
    </Card>
  );
}

/** Primary accessible plan panel presenting the personalized exposure budget, mitigations, and optimal windows. */
export function PlanPanel({ clock, onNavigateTab }: PlanPanelProps = {}): JSX.Element {
  const { viewModel, hasData, isLoading, isActionExpanded, toggleActionExpanded } = usePlan(clock);
  const language = useAppStore((s) => s.language);
  const airData = useAppStore((s) => s.airData);
  const plan = useAppStore((s) => s.plan);

  const title = translate(language, 'plan.title');
  const subtitle = translate(language, 'plan.subtitle');

  if (isLoading) {
    return (
      <Section id="exposure-plan" title={title} subtitle={subtitle}>
        <div className="py-12 flex justify-center">
          <Spinner label="Calculating personalized exposure budget..." />
        </div>
      </Section>
    );
  }

  if (!hasData || !viewModel || !airData) {
    return (
      <Section id="exposure-plan" title={title} subtitle={subtitle}>
        <Card className="py-6 flex flex-col gap-4 text-left">
          <Notice variant="info" className="w-full">
            {translate(language, 'plan.empty.guide')}
          </Notice>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => onNavigateTab?.('location')}>
              1) {translate(language, 'app.nav.location')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onNavigateTab?.('household')}>
              2) {translate(language, 'app.nav.household')}
            </Button>
          </div>
        </Card>
      </Section>
    );
  }

  return (
    <Section id="exposure-plan" title={title} subtitle={subtitle}>
      <div className="flex flex-col gap-6">
        {plan && <PlanExportBar plan={plan} clock={clock} />}
        <ExposureBudgetCard
          comparison={viewModel.comparison}
          members={viewModel.members}
          lang={language}
        />
        <RankedActionsList
          groups={viewModel.actionGroups}
          isActionExpanded={isActionExpanded}
          onToggleWhy={toggleActionExpanded}
          lang={language}
        />
        <BestWindowsCard windows={viewModel.bestWindows} hourly={airData.hourly} lang={language} />
      </div>
    </Section>
  );
}
