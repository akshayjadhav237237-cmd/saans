import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as dataIndex from '../src/data/index';
import { createManualAirQuality, fetchAirQuality } from '../src/data/airquality';
import { CACHE_TTL_MS, SessionCache } from '../src/data/cache';
import { PRESET_CITIES } from '../src/data/cities';
import { searchCities } from '../src/data/geocode';
import { fetchJson } from '../src/data/http';
import type { Clock } from '../src/domain/ports';

describe('Data Adapters & HTTP Engine', () => {
  let mockTime = 100000;
  const mockClock: Clock = {
    now: () => mockTime,
    iso: () => new Date(mockTime).toISOString(),
  };

  beforeEach(() => {
    mockTime = 100000;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchJson handles successful responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({ status: 'ok' }),
    });

    const res = await fetchJson<{ status: string }>('https://example.com/api');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.status).toBe('ok');
  });

  it('fetchJson handles HTTP error status codes safely without throwing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
    });

    const res = await fetchJson('https://example.com/api');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('http.error.status_404');
  });

  it('fetchJson handles timeout abort', async () => {
    global.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const res = await fetchJson('https://example.com/api');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('http.error.timeout');
  });

  it('fetchJson rejects payloads exceeding size threshold', async () => {
    const headers = new Headers();
    headers.set('content-length', '3000000'); // 3MB > 2MB limit
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers,
      json: async () => ({}),
    });

    const res = await fetchJson('https://example.com/large');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe('http.error.response_too_large');
  });

  it('searchCities parses geocoding results and returns empty for short queries', async () => {
    const emptyRes = await searchCities('a');
    expect(emptyRes.ok).toBe(true);
    if (emptyRes.ok) expect(emptyRes.value.length).toBe(0);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        results: [{ id: 1, name: 'Delhi', latitude: 28.6, longitude: 77.2, country: 'India' }],
      }),
    });

    const searchRes = await searchCities('Delhi');
    expect(searchRes.ok).toBe(true);
    if (searchRes.ok) {
      expect(searchRes.value.length).toBe(1);
      expect(searchRes.value[0]?.name).toBe('Delhi');
    }
  });

  it('fetchAirQuality parses Open-Meteo responses and populates 24h series', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        current: { us_aqi: 250, pm2_5: 180 },
        hourly: {
          time: Array.from({ length: 24 }, (_, i) => `2026-11-19T${i}:00`),
          pm2_5: Array.from({ length: 24 }, () => 180),
          us_aqi: Array.from({ length: 24 }, () => 250),
        },
      }),
    });

    const res = await fetchAirQuality(28.6, 77.2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.currentAqi).toBe(250);
      expect(res.value.currentPm25).toBe(180);
      expect(res.value.hourly.length).toBe(24);
      expect(res.value.isManual).toBe(false);
    }
  });

  it('fetchAirQuality handles missing current measurements and falls back to hourly series', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({
        hourly: {
          time: Array.from({ length: 24 }, (_, i) => `2026-11-19T${i}:00`),
          pm2_5: Array.from({ length: 24 }, () => 120),
          us_aqi: Array.from({ length: 24 }, () => 185),
        },
      }),
    });

    const res = await fetchAirQuality(28.6, 77.2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.currentAqi).toBe(185);
      expect(res.value.currentPm25).toBe(120);
    }
  });

  it('fetchAirQuality and searchCities return structured error on invalid JSON schemas', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => ({ results: 'invalid', hourly: 'invalid' }),
    });

    const aqRes = await fetchAirQuality(28.6, 77.2);
    expect(aqRes.ok).toBe(false);
    if (!aqRes.ok) expect(aqRes.error).toBe('airquality.error.invalid_format');

    const geoRes = await searchCities('Kolkata');
    expect(geoRes.ok).toBe(false);
    if (!geoRes.ok) expect(geoRes.error).toBe('geocode.error.invalid_format');
  });

  it('createManualAirQuality produces valid flat 24h synthetic series', () => {
    const manual = createManualAirQuality(150);
    expect(manual.isManual).toBe(true);
    expect(manual.currentPm25).toBe(150);
    expect(manual.hourly.length).toBe(24);
    expect(manual.hourly.every((h) => h.pm25 === 150)).toBe(true);
  });

  it('SessionCache caches items and honors expiration TTL', () => {
    expect(CACHE_TTL_MS).toBe(30 * 60 * 1000);
    const cache = new SessionCache<string>(mockClock);
    cache.set('test_key', 'hello', 1000);

    expect(cache.get('test_key')).toBe('hello');
    mockTime += 1500; // Fast-forward past TTL
    expect(cache.get('test_key')).toBeNull();

    cache.set('test_key2', 'world', 5000);
    cache.clear();
    expect(cache.get('test_key2')).toBeNull();
  });

  it('PRESET_CITIES contains 8 verified Indian cities with coordinates', () => {
    expect(PRESET_CITIES.length).toBe(8);
    for (const city of PRESET_CITIES) {
      expect(city.name).toBeDefined();
      expect(city.latitude).toBeGreaterThan(8);
      expect(city.latitude).toBeLessThan(36);
      expect(city.longitude).toBeGreaterThan(68);
      expect(city.longitude).toBeLessThan(98);
    }
  });

  it('exports all public adapters and constants from index', () => {
    expect(dataIndex.fetchJson).toBeTypeOf('function');
    expect(dataIndex.searchCities).toBeTypeOf('function');
    expect(dataIndex.fetchAirQuality).toBeTypeOf('function');
    expect(dataIndex.createManualAirQuality).toBeTypeOf('function');
    expect(dataIndex.SessionCache).toBeDefined();
    expect(dataIndex.PRESET_CITIES).toBeDefined();
  });
});
