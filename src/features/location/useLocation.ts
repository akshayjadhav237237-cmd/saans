import { useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../state/store';
import { fetchAirQuality } from '../../data/airquality';
import { PRESET_CITIES } from '../../data/cities';
import type { AirQualityData, GeoLocation } from '../../data/types';
import { useCitySearch, type UseCitySearchResult } from './useCitySearch';
import { useManualPm25, type UseManualPm25Result } from './useManualPm25';
import { toLocationDisplayModel, type LocationDisplayModel } from './location.viewmodel';

export interface UseLocationResult extends UseCitySearchResult, UseManualPm25Result {
  readonly selectedCity: GeoLocation | null;
  readonly airData: AirQualityData | null;
  readonly isAirLoading: boolean;
  readonly airError: string | null;
  readonly displayModel: LocationDisplayModel | null;
  readonly presetCities: readonly GeoLocation[];
  readonly selectCity: (city: GeoLocation) => Promise<void>;
  readonly retryFetch: () => Promise<void>;
}

function useLocationStoreSlice() {
  const selectedCity = useAppStore((s) => s.selectedCity);
  const setSelectedCity = useAppStore((s) => s.setSelectedCity);
  const airData = useAppStore((s) => s.airData);
  const setAirData = useAppStore((s) => s.setAirData);
  const isAirLoading = useAppStore((s) => s.isAirLoading);
  const setAirLoading = useAppStore((s) => s.setAirLoading);
  const airError = useAppStore((s) => s.airError);
  const setAirError = useAppStore((s) => s.setAirError);
  return {
    selectedCity,
    setSelectedCity,
    airData,
    setAirData,
    isAirLoading,
    setAirLoading,
    airError,
    setAirError,
  };
}

async function executeCitySelection(
  city: GeoLocation,
  store: ReturnType<typeof useLocationStoreSlice>,
  clearSearch: () => void,
): Promise<void> {
  store.setSelectedCity(city);
  clearSearch();
  store.setAirLoading(true);
  const res = await fetchAirQuality(city.latitude, city.longitude);
  store.setAirLoading(false);
  if (res.ok) {
    store.setAirData(res.value);
  } else {
    store.setAirError(res.error);
  }
}

function computeDisplayModel(
  selectedCity: GeoLocation | null,
  airData: AirQualityData | null,
): LocationDisplayModel | null {
  const city = selectedCity ?? PRESET_CITIES[0] ?? null;
  return city && airData ? toLocationDisplayModel(city, airData) : null;
}

/**
 * View-model hook orchestrating location selection, air quality queries, and manual overrides.
 */
export function useLocation(): UseLocationResult {
  const store = useLocationStoreSlice();
  const search = useCitySearch();
  const handleSetAirData = useCallback(
    (data: AirQualityData | null) => {
      if (!store.selectedCity && PRESET_CITIES[0]) {
        store.setSelectedCity(PRESET_CITIES[0]);
      }
      store.setAirData(data);
    },
    [store],
  );
  const manual = useManualPm25(handleSetAirData);

  const selectCity = useCallback(
    (city: GeoLocation) => executeCitySelection(city, store, search.clearSearch),
    [store, search.clearSearch],
  );

  useEffect(() => {
    if (store.selectedCity && !store.airData && !store.isAirLoading && !store.airError) {
      void selectCity(store.selectedCity);
    }
  }, [store.selectedCity, store.airData, store.isAirLoading, store.airError, selectCity]);

  const retryFetch = useCallback(async (): Promise<void> => {
    if (store.selectedCity) {
      store.setAirError(null);
      await selectCity(store.selectedCity);
    }
  }, [store, selectCity]);

  const displayModel = useMemo(
    () => computeDisplayModel(store.selectedCity, store.airData),
    [store.selectedCity, store.airData],
  );

  return {
    selectedCity: store.selectedCity,
    airData: store.airData,
    isAirLoading: store.isAirLoading,
    airError: store.airError,
    displayModel,
    presetCities: PRESET_CITIES,
    ...search,
    ...manual,
    selectCity,
    retryFetch,
  };
}
