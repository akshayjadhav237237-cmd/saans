import { describe, it, expect } from 'vitest';
import { classifyAqi, getAqiResult } from '../src/domain/aqi';
import { AQI_DATA_SOURCE, type AqiBreakpoint } from '../src/config/aqi-constants';

describe('AQI categorization engine', () => {
  it('documents open-meteo us_aqi data source in configuration', () => {
    expect(AQI_DATA_SOURCE.provider).toBe('Open-Meteo');
    const sampleBreakpoint: AqiBreakpoint = {
      min: 0,
      max: 50,
      band: 'good',
      labelKey: 'aqi.band.good',
    };
    expect(sampleBreakpoint.band).toBe('good');
  });
  const cases: Array<[number, string]> = [
    [-10, 'good'],
    [0, 'good'],
    [25, 'good'],
    [50, 'good'],
    [51, 'moderate'],
    [75, 'moderate'],
    [100, 'moderate'],
    [101, 'unhealthy_sensitive'],
    [125, 'unhealthy_sensitive'],
    [150, 'unhealthy_sensitive'],
    [151, 'unhealthy'],
    [175, 'unhealthy'],
    [200, 'unhealthy'],
    [201, 'very_unhealthy'],
    [250, 'very_unhealthy'],
    [300, 'very_unhealthy'],
    [301, 'hazardous'],
    [500, 'hazardous'],
  ];

  it.each(cases)('classifies AQI %i into band %s', (aqi, expectedBand) => {
    expect(classifyAqi(aqi)).toBe(expectedBand);
  });

  it('constructs complete AqiResult with matching localization key', () => {
    const res = getAqiResult(75);
    expect(res.aqi).toBe(75);
    expect(res.band).toBe('moderate');
    expect(res.labelKey).toBe('aqi.band.moderate');
  });

  it('handles negative or decimal inputs safely', () => {
    const res = getAqiResult(-5.4);
    expect(res.aqi).toBe(0);
    expect(res.band).toBe('good');
  });

  it('classifies AQI values exceeding 500 as hazardous', () => {
    expect(classifyAqi(600)).toBe('hazardous');
    const res = getAqiResult(650);
    expect(res.band).toBe('hazardous');
  });
});
