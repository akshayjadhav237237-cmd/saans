import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppStore } from '../src/state/store';
import { PRESET_CITIES } from '../src/data/cities';
import type { AirQualityData, GeoLocation } from '../src/data/types';
import * as airModule from '../src/data/airquality';
import * as geoModule from '../src/data/geocode';
import { LocationPanel } from '../src/features/location/LocationPanel';
import {
  formatLocationName,
  formatPm25Display,
  parseManualPm25Input,
  resolveAqiBandKey,
  toLocationDisplayModel,
} from '../src/features/location/location.viewmodel';
import { ok } from '../src/domain/result';

const sampleLocation: GeoLocation = {
  id: 1273294,
  name: 'Delhi',
  latitude: 28.61,
  longitude: 77.2,
  country: 'India',
  admin1: 'Delhi',
};

const sampleAirData: AirQualityData = {
  currentAqi: 220,
  currentPm25: 170,
  hourly: [],
  isManual: false,
};

describe('location.viewmodel', () => {
  it('formats location names with admin1 or country correctly', () => {
    expect(formatLocationName(sampleLocation)).toBe('Delhi, India');
    const withAdmin: GeoLocation = { ...sampleLocation, name: 'Gurugram', admin1: 'Haryana' };
    expect(formatLocationName(withAdmin)).toBe('Gurugram, Haryana');
  });

  it('formats PM2.5 values into microgram strings', () => {
    expect(formatPm25Display(123.4)).toBe('123 µg/m³');
    expect(formatPm25Display(-10)).toBe('0 µg/m³');
  });

  it('constructs a display model with correct band, attribution, and manual flag', () => {
    const model = toLocationDisplayModel(sampleLocation, sampleAirData);
    expect(model.cityName).toBe('Delhi');
    expect(model.aqi).toBe(220);
    expect(model.aqiBand).toBe('very_unhealthy');
    expect(model.aqiBandLabelKey).toBe('aqi.band.very_unhealthy');
    expect(model.pm25).toBe(170);
    expect(model.isManual).toBe(false);
    expect(model.attribution).toContain('Open-Meteo');
  });

  it('parses valid manual PM2.5 inputs and rejects invalid/out-of-range', () => {
    const valid = parseManualPm25Input('185');
    expect(valid.ok).toBe(true);
    if (valid.ok) expect(valid.value).toBe(185);

    expect(parseManualPm25Input('').ok).toBe(false);
    expect(parseManualPm25Input('abc').ok).toBe(false);
    expect(parseManualPm25Input('-5').ok).toBe(false);
    expect(parseManualPm25Input('1500').ok).toBe(false);
  });
});

describe('LocationPanel Component', () => {
  beforeEach(() => {
    useAppStore.setState({
      selectedCity: sampleLocation,
      airData: sampleAirData,
      isAirLoading: false,
      airError: null,
    });
    vi.restoreAllMocks();
  });

  it('renders preset city chips and highlights selected city', () => {
    render(<LocationPanel />);
    const delhiChip = screen.getByRole('button', { name: 'Delhi' });
    expect(delhiChip.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Mumbai' })).toBeDefined();
  });

  it('fetches air quality when selecting a different preset chip', async () => {
    const gurugram = PRESET_CITIES[1];
    if (!gurugram) throw new Error('Missing preset');
    const spy = vi
      .spyOn(airModule, 'fetchAirQuality')
      .mockResolvedValue(ok({ ...sampleAirData, currentAqi: 180, currentPm25: 110 }));

    render(<LocationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Gurugram' }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(gurugram.latitude, gurugram.longitude);
      expect(screen.getByText('180')).toBeDefined();
    });
  });

  it('displays search results and allows selecting a city', async () => {
    const searchedCity: GeoLocation = {
      id: 9999,
      name: 'Faridabad',
      latitude: 28.4,
      longitude: 77.3,
      country: 'India',
      admin1: 'Haryana',
    };
    vi.spyOn(geoModule, 'searchCities').mockResolvedValue(ok([searchedCity]));
    const airSpy = vi.spyOn(airModule, 'fetchAirQuality').mockResolvedValue(ok(sampleAirData));

    render(<LocationPanel />);
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'Fari' } });

    await waitFor(
      () => {
        expect(screen.getByText('Faridabad')).toBeDefined();
      },
      { timeout: 1000 },
    );

    fireEvent.click(screen.getByText('Faridabad'));
    await waitFor(() => {
      expect(airSpy).toHaveBeenCalledWith(28.4, 77.3);
    });
  });

  it('renders live card with AQI, PM2.5, attribution, and updated text', () => {
    render(<LocationPanel />);
    expect(screen.getByText('220')).toBeDefined();
    expect(screen.getByText('170')).toBeDefined();
    expect(screen.getByText(/Open-Meteo/i)).toBeDefined();
    expect(screen.getByText(/forecast model/i)).toBeDefined();
  });

  it('toggles manual entry and updates live card with manual override', async () => {
    render(<LocationPanel />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    const input = screen.getByLabelText(/Manual PM2.5/i);
    fireEvent.change(input, { target: { value: '350' } });
    fireEvent.click(screen.getByRole('button', { name: /Set Manual Value/i }));

    await waitFor(() => {
      expect(screen.getByText('350')).toBeDefined();
      expect(screen.getByText(/manual PM2.5 override/i)).toBeDefined();
    });
  });

  it('renders spinner during loading state', () => {
    useAppStore.setState({ isAirLoading: true, airData: null });
    render(<LocationPanel />);
    expect(screen.getByText(/Loading air quality/i)).toBeDefined();
  });

  it('renders error notice and handles retry when fetch fails', async () => {
    useAppStore.setState({ isAirLoading: false, airError: 'network error', airData: null });
    const spy = vi.spyOn(airModule, 'fetchAirQuality').mockResolvedValue(ok(sampleAirData));

    render(<LocationPanel />);
    expect(screen.getByText(/Failed to load live air quality data/i)).toBeDefined();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('resolves correct translation key for AQI bands', () => {
    expect(resolveAqiBandKey('hazardous')).toBe('aqi.band.hazardous');
    expect(resolveAqiBandKey('good')).toBe('aqi.band.good');
  });
});
