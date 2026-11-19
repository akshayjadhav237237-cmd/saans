import { APP_CONFIG } from '../../config/constants';
import { classifyAqi } from '../../domain/aqi';
import { ok, err, type Result } from '../../domain/result';
import type { AqiBand } from '../../domain/types';
import type { AirQualityData, GeoLocation } from '../../data/types';
import type { TranslationKey } from '../../i18n';

export interface LocationDisplayModel {
  readonly cityName: string;
  readonly fullLocationName: string;
  readonly aqi: number;
  readonly aqiBand: AqiBand;
  readonly aqiBandLabelKey: TranslationKey;
  readonly pm25: number;
  readonly formattedPm25: string;
  readonly isManual: boolean;
  readonly attribution: string;
}

/**
 * Resolves the translation dictionary key corresponding to a given AQI band.
 */
export function resolveAqiBandKey(band: AqiBand): TranslationKey {
  switch (band) {
    case 'good':
      return 'aqi.band.good';
    case 'moderate':
      return 'aqi.band.moderate';
    case 'unhealthy_sensitive':
      return 'aqi.band.unhealthy_sensitive';
    case 'unhealthy':
      return 'aqi.band.unhealthy';
    case 'very_unhealthy':
      return 'aqi.band.very_unhealthy';
    case 'hazardous':
      return 'aqi.band.hazardous';
  }
}

/**
 * Formats a geographic location into a human-readable display string.
 */
export function formatLocationName(location: GeoLocation): string {
  if (location.admin1 && location.admin1 !== location.name) {
    return `${location.name}, ${location.admin1}`;
  }
  return `${location.name}, ${location.country}`;
}

/**
 * Formats a PM2.5 numerical concentration into integer microgram units.
 */
export function formatPm25Display(pm25: number): string {
  const safePm25 = Math.max(0, Math.round(pm25));
  return `${safePm25} µg/m³`;
}

/**
 * Transforms raw air quality data and location records into a display view model.
 */
export function toLocationDisplayModel(
  location: GeoLocation,
  airData: AirQualityData,
): LocationDisplayModel {
  const safeAqi = Math.max(0, Math.round(airData.currentAqi));
  const band = classifyAqi(safeAqi);
  const aqiBandLabelKey = resolveAqiBandKey(band);
  const safePm25 = Math.max(0, Math.round(airData.currentPm25));

  return {
    cityName: location.name,
    fullLocationName: formatLocationName(location),
    aqi: safeAqi,
    aqiBand: band,
    aqiBandLabelKey,
    pm25: safePm25,
    formattedPm25: formatPm25Display(safePm25),
    isManual: Boolean(airData.isManual),
    attribution: APP_CONFIG.attributionText,
  };
}

/**
 * Validates and parses user manual PM2.5 input within the acceptable range.
 */
export function parseManualPm25Input(rawInput: string): Result<number, string> {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return err('Please enter a PM2.5 value');
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return err('PM2.5 value must be a valid number');
  }
  if (parsed < 0 || parsed > 1000) {
    return err('PM2.5 must be between 0 and 1000 µg/m³');
  }
  return ok(Math.round(parsed));
}
