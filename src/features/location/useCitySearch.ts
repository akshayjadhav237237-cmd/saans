import { useState, useEffect, useCallback } from 'react';
import { searchCities } from '../../data/geocode';
import type { GeoLocation } from '../../data/types';

export interface UseCitySearchResult {
  readonly searchQuery: string;
  readonly setSearchQuery: (query: string) => void;
  readonly searchResults: readonly GeoLocation[];
  readonly isSearching: boolean;
  readonly searchError: string | null;
  readonly clearSearch: () => void;
}

/** Manages debounced city geocoding search state and async request lifecycle. */
export function useCitySearch(): UseCitySearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<readonly GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    let isCurrent = true;
    const timer: ReturnType<typeof setTimeout> = setTimeout(async () => {
      const res = await searchCities(trimmed);
      if (!isCurrent) {
        return;
      }
      setIsSearching(false);
      if (res.ok) {
        setSearchResults(res.value);
      } else {
        setSearchError(res.error);
        setSearchResults([]);
      }
    }, 400);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    clearSearch,
  };
}
