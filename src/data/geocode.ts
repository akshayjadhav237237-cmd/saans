import { z } from 'zod';
import { err, ok, type Result } from '../domain/result';
import { fetchJson } from './http';
import type { GeoLocation } from './types';

z.config({ jitless: true });

const GeocodingItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().default('India'),
  admin1: z.string().optional(),
});

const GeocodingResponseSchema = z.object({
  results: z.array(GeocodingItemSchema).optional(),
});

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Searches locations matching a query string using the Open-Meteo Geocoding API. */
export async function searchCities(query: string): Promise<Result<readonly GeoLocation[], string>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return ok([]);
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en`;
  const res = await fetchJson<unknown>(url);

  if (!res.ok) {
    return err(res.error);
  }

  const parsed = GeocodingResponseSchema.safeParse(res.value);
  if (!parsed.success) {
    return err('geocode.error.invalid_format');
  }

  return ok(parsed.data.results ?? []);
}
