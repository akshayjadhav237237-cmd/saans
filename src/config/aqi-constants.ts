import type { AqiBand } from '../domain/types';

/**
 * AQI breakpoint threshold definition with official source citations.
 */
export interface AqiBreakpoint {
  readonly band: AqiBand;
  readonly min: number;
  readonly max: number;
  readonly labelKey: string;
}

/**
 * Standard US EPA AQI breakpoints used by Open-Meteo data provider.
 * Note: India CPCB bands differ; app uses US AQI because the data provider returns it.
 * Source: https://www.airnow.gov/aqi/aqi-basics/
 */
export const AQI_BREAKPOINTS: readonly AqiBreakpoint[] = [
  { band: 'good', min: 0, max: 50, labelKey: 'aqi.band.good' },
  { band: 'moderate', min: 51, max: 100, labelKey: 'aqi.band.moderate' },
  { band: 'unhealthy_sensitive', min: 101, max: 150, labelKey: 'aqi.band.unhealthy_sensitive' },
  { band: 'unhealthy', min: 151, max: 200, labelKey: 'aqi.band.unhealthy' },
  { band: 'very_unhealthy', min: 201, max: 300, labelKey: 'aqi.band.very_unhealthy' },
  { band: 'hazardous', min: 301, max: 1000, labelKey: 'aqi.band.hazardous' },
] as const;

export const AQI_DATA_SOURCE = {
  provider: 'Open-Meteo',
  standard: 'US EPA AQI',
  sourceUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
  note: 'India CPCB bands differ; app uses US AQI because the data provider returns it.',
} as const;
