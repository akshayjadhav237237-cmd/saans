import { z } from 'zod';
import { err, ok, type Result } from '../domain/result';
import type { HourlyReading, HourlySeries } from '../domain/types';
import { fetchJson } from './http';
import type { AirQualityData } from './types';

const AirQualityResponseSchema = z.object({
  current: z
    .object({
      us_aqi: z.number().nullable().optional(),
      pm2_5: z.number().nullable().optional(),
      pm10: z.number().nullable().optional(),
    })
    .optional(),
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.number().nullable()),
    us_aqi: z.array(z.number().nullable()),
  }),
});

const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/** Extracts normalized hourly readings from API series. */
function extractHourlyReadings(
  pm25Series: readonly (number | null)[],
  aqiSeries: readonly (number | null)[],
  count: number,
): HourlyReading[] {
  const readings: HourlyReading[] = [];
  for (let i = 0; i < count; i += 1) {
    const rawPm25 = pm25Series[i];
    const rawAqi = aqiSeries[i];
    const pm25 = rawPm25 !== null && rawPm25 !== undefined ? Math.round(rawPm25) : 100;
    const aqi = rawAqi !== null && rawAqi !== undefined ? Math.round(rawAqi) : 174;
    readings.push({ hour: i, pm25, aqi });
  }
  return readings;
}

/** Creates a synthetic 24-hour flat air quality series for manual user override. */
export function createManualAirQuality(manualPm25: number): AirQualityData {
  const pm25 = Math.max(0, Math.round(manualPm25));
  const approxAqi = Math.round(pm25 * 1.6);
  const hourly: HourlySeries = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    pm25,
    aqi: approxAqi,
  }));

  return {
    hourly,
    currentAqi: approxAqi,
    currentPm25: pm25,
    isManual: true,
  };
}

/** Fetches real-time ambient air quality and 24-hour forecast from Open-Meteo API. */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<Result<AirQualityData, string>> {
  const url = `${AIR_QUALITY_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10&hourly=pm2_5,us_aqi&forecast_days=2&timezone=auto`;
  const res = await fetchJson<unknown>(url);

  if (!res.ok) {
    return err(res.error);
  }

  const parsed = AirQualityResponseSchema.safeParse(res.value);
  if (!parsed.success) {
    return err('airquality.error.invalid_format');
  }

  const data = parsed.data;
  const count = Math.min(24, data.hourly.time.length);
  const hourly = extractHourlyReadings(data.hourly.pm2_5, data.hourly.us_aqi, count);
  const first = hourly[0];

  const currentAqi = data.current?.us_aqi ?? (first ? first.aqi : 100);
  const currentPm25 = data.current?.pm2_5 ?? (first ? first.pm25 : 50);

  return ok({
    hourly,
    currentAqi: Math.round(currentAqi),
    currentPm25: Math.round(currentPm25),
    isManual: false,
  });
}
