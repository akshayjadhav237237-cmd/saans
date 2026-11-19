import { useAppStore } from '../../state/store';
import { translate } from '../../i18n';
import { Section } from '../../shared/Section';
import { useLocation } from './useLocation';
import { PresetChips } from './PresetChips';
import { CitySearchInput } from './CitySearchInput';
import { LiveAqiCard } from './LiveAqiCard';
import { ManualPm25Section } from './ManualPm25Section';

/** Root location and air quality monitoring panel providing search, presets, and live card metrics. */
export function LocationPanel(): JSX.Element {
  const language = useAppStore((s) => s.language);
  const loc = useLocation();

  return (
    <Section id="location-panel" title={translate(language, 'location.title')}>
      <div className="flex flex-col gap-6">
        <PresetChips
          presets={loc.presetCities}
          selectedCityId={loc.selectedCity?.id}
          onSelect={(city) => {
            void loc.selectCity(city);
          }}
          label={translate(language, 'location.presets.label')}
        />

        <CitySearchInput
          query={loc.searchQuery}
          onChangeQuery={loc.setSearchQuery}
          results={loc.searchResults}
          isSearching={loc.isSearching}
          error={loc.searchError}
          onSelectCity={(city) => {
            void loc.selectCity(city);
          }}
          label={translate(language, 'location.search.label')}
          placeholder={translate(language, 'location.search.placeholder')}
        />

        <LiveAqiCard
          model={loc.displayModel}
          isLoading={loc.isAirLoading}
          error={loc.airError}
          onRetry={() => {
            void loc.retryFetch();
          }}
        />

        <ManualPm25Section
          isOpen={loc.isManualOpen}
          onToggle={loc.setIsManualOpen}
          value={loc.manualInput}
          onChangeValue={loc.setManualInput}
          onSubmit={loc.submitManualPm25}
          error={loc.manualError}
        />
      </div>
    </Section>
  );
}
