import type { GeoLocation } from '../../data/types';

export interface PresetChipsProps {
  readonly presets: readonly GeoLocation[];
  readonly selectedCityId: number | undefined;
  readonly onSelect: (city: GeoLocation) => void;
  readonly label: string;
}

/** Renders quick-select interactive chips for high-priority smog hotspot cities. */
export function PresetChips({
  presets,
  selectedCityId,
  onSelect,
  label,
}: PresetChipsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {presets.map((city) => {
          const isSelected = city.id === selectedCityId;
          return (
            <button
              key={city.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(city)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus ${
                isSelected
                  ? 'bg-teal text-text-inverse border-teal'
                  : 'bg-bg-surface text-text-main border-border hover:bg-bg-elevated'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
