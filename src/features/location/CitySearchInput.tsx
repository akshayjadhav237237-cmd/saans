import type { GeoLocation } from '../../data/types';
import { Spinner } from '../../shared/Spinner';

export interface CitySearchInputProps {
  readonly query: string;
  readonly onChangeQuery: (query: string) => void;
  readonly results: readonly GeoLocation[];
  readonly isSearching: boolean;
  readonly error: string | null;
  readonly onSelectCity: (city: GeoLocation) => void;
  readonly label: string;
  readonly placeholder: string;
}

/** Accessible search input with debounced autocomplete results for Indian cities. */
export function CitySearchInput({
  query,
  onChangeQuery,
  results,
  isSearching,
  error,
  onSelectCity,
  label,
  placeholder,
}: CitySearchInputProps): JSX.Element {
  return (
    <div className="relative flex flex-col gap-1 text-left">
      <label htmlFor="city-search-input" className="text-sm font-medium text-text-main">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id="city-search-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-controls="city-search-listbox"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[44px] px-3 py-2 pr-10 border border-border rounded-lg bg-bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus"
        />
        {isSearching && (
          <div className="absolute right-2 flex items-center pointer-events-none">
            <Spinner label="Searching cities..." className="p-0" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <ul
          id="city-search-listbox"
          role="listbox"
          aria-label={label}
          className="absolute z-20 top-full left-0 right-0 mt-1 bg-bg-surface border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {results.map((city) => (
            <li key={city.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => onSelectCity(city)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-bg-elevated focus:bg-bg-elevated min-h-[44px] flex items-center justify-between"
              >
                <span className="font-medium text-text-main">{city.name}</span>
                <span className="text-xs text-text-muted">
                  {city.admin1 ? `${city.admin1}, ` : ''}
                  {city.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-amber-dark mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
