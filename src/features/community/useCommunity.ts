import { useMemo } from 'react';
import { buildAdvisory } from '../../domain/advisory';
import { classifyAqi } from '../../domain/aqi';
import type { CommunityAdvisory } from '../../domain/types';
import { useAppStore } from '../../state/store';
import { toCommunityViewModel, type CommunityViewModel } from './community.viewmodel';

export interface UseCommunityOptions {
  readonly city?: string;
  readonly aqi?: number;
}

export interface UseCommunityResult extends CommunityViewModel {
  readonly advisory: CommunityAdvisory;
  readonly viewModel: CommunityViewModel;
}

const DEFAULT_CITY = 'Delhi';
const DEFAULT_AQI = 100;

/**
 * React hook computing reactive community advisory and viewmodel from store state.
 */
export function useCommunity(options?: UseCommunityOptions): UseCommunityResult {
  const language = useAppStore((state) => state.language);
  const selectedCity = useAppStore((state) => state.selectedCity);
  const airData = useAppStore((state) => state.airData);
  const profile = useAppStore((state) => state.profile);

  return useMemo(() => {
    const cityName = options?.city ?? selectedCity?.name ?? profile.city ?? DEFAULT_CITY;
    const aqi = options?.aqi ?? airData?.currentAqi ?? DEFAULT_AQI;
    const band = classifyAqi(aqi);

    const advisory = buildAdvisory({
      aqi,
      city: cityName,
      dominantCategory: band,
    });

    const viewModel = toCommunityViewModel(advisory, language);

    return {
      ...viewModel,
      advisory,
      viewModel,
    };
  }, [options?.city, options?.aqi, language, selectedCity, airData, profile]);
}
