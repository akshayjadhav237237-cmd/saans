import type { HourlySeries } from '../domain/types';

export interface GeoLocation {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly admin1?: string | undefined;
}

export interface AirQualityData {
  readonly hourly: HourlySeries;
  readonly currentAqi: number;
  readonly currentPm25: number;
  readonly isManual?: boolean;
}

export interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
}
