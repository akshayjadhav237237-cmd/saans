import { AQI_BREAKPOINTS } from '../config/aqi-constants';
import type { AqiBand, AqiResult } from './types';

/**
 * Classifies a US AQI index value into its standard descriptive category band.
 */
export function classifyAqi(usAqi: number): AqiBand {
  const safeAqi = Math.max(0, Math.round(usAqi));
  for (const bp of AQI_BREAKPOINTS) {
    if (safeAqi <= bp.max) {
      return bp.band;
    }
  }
  return 'hazardous';
}

/**
 * Constructs an AqiResult record containing localized key and category band.
 */
export function getAqiResult(usAqi: number): AqiResult {
  const safeAqi = Math.max(0, Math.round(usAqi));
  const band = classifyAqi(safeAqi);
  for (const bp of AQI_BREAKPOINTS) {
    if (bp.band === band) {
      return { aqi: safeAqi, band, labelKey: bp.labelKey };
    }
  }
  return { aqi: safeAqi, band: 'hazardous', labelKey: 'aqi.band.hazardous' };
}
