import { useState, useCallback } from 'react';
import { createManualAirQuality } from '../../data/airquality';
import type { AirQualityData } from '../../data/types';
import { parseManualPm25Input } from './location.viewmodel';

export interface UseManualPm25Result {
  readonly manualInput: string;
  readonly setManualInput: (value: string) => void;
  readonly manualError: string | null;
  readonly isManualOpen: boolean;
  readonly setIsManualOpen: (open: boolean) => void;
  readonly applyManualPm25: (pm25: number) => void;
  readonly submitManualPm25: () => boolean;
}

/**
 * Manages user manual PM2.5 override state, validation, and store synchronization.
 */
export function useManualPm25(
  setAirData: (data: AirQualityData | null) => void,
): UseManualPm25Result {
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const applyManualPm25 = useCallback(
    (pm25: number): void => {
      const manual = createManualAirQuality(pm25);
      setAirData(manual);
      setManualError(null);
    },
    [setAirData],
  );

  const submitManualPm25 = useCallback((): boolean => {
    const parsed = parseManualPm25Input(manualInput);
    if (!parsed.ok) {
      setManualError(parsed.error);
      return false;
    }
    applyManualPm25(parsed.value);
    return true;
  }, [manualInput, applyManualPm25]);

  return {
    manualInput,
    setManualInput,
    manualError,
    isManualOpen,
    setIsManualOpen,
    applyManualPm25,
    submitManualPm25,
  };
}
