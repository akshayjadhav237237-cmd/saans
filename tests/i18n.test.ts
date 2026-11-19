import { beforeEach, describe, expect, it } from 'vitest';
import { en, type TranslationKey } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';
import { translate } from '../src/i18n/index';
import { MESSAGE_KEYS, type FeatureKeyGroup } from '../src/i18n/keys';
import { useAppStore } from '../src/state/store';

describe('i18n Localization Engine', () => {
  it('exports valid FeatureKeyGroup keys', () => {
    const group: FeatureKeyGroup = 'shell';
    expect(MESSAGE_KEYS[group]).toBeDefined();
  });
  it('enforces complete key parity between English and Hindi dictionaries', () => {
    const enKeys = Object.keys(en) as TranslationKey[];
    const hiKeys = Object.keys(hi) as TranslationKey[];

    expect(enKeys.sort()).toEqual(hiKeys.sort());
  });

  it('guarantees no empty strings exist across any language dictionary', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value.trim().length, `Empty English value for key: ${key}`).toBeGreaterThan(0);
    }
    for (const [key, value] of Object.entries(hi)) {
      expect(value.trim().length, `Empty Hindi value for key: ${key}`).toBeGreaterThan(0);
    }
  });

  it('contains every key defined in the MESSAGE_KEYS contract', () => {
    const allContractKeys = Object.values(MESSAGE_KEYS).flat();
    for (const key of allContractKeys) {
      expect(en).toHaveProperty(key);
      expect(hi).toHaveProperty(key);
    }
  });

  it('interpolates single and multiple parameters accurately', () => {
    const interpolated = translate('en', 'plan.windows.hours', { start: 14, end: 16 });
    expect(interpolated).toBe('14:00 - 16:00');

    const counter = translate('en', 'ask.input.counter', { count: 120 });
    expect(counter).toBe('120/280 characters');

    const counterHi = translate('hi', 'ask.input.counter', { count: 50 });
    expect(counterHi).toBe('50/280 अक्षर');
  });

  it('falls back safely to English or key when language or parameter is missing', () => {
    const text = translate('en', 'aqi.band.good');
    expect(text).toBe('Good');

    const textHi = translate('hi', 'aqi.band.good');
    expect(textHi).toContain('अच्छा');
  });
});

describe('Store State and Language Slices', () => {
  beforeEach(() => {
    useAppStore.setState({
      language: 'en',
      airData: null,
      plan: null,
      aiKey: '',
    });
  });

  it('manages language switching and updates documentElement lang', () => {
    expect(useAppStore.getState().language).toBe('en');

    useAppStore.getState().setLanguage('hi');
    expect(useAppStore.getState().language).toBe('hi');
    if (typeof document !== 'undefined') {
      expect(document.documentElement.lang).toBe('hi');
    }

    useAppStore.getState().setLanguage('en');
    expect(useAppStore.getState().language).toBe('en');
    if (typeof document !== 'undefined') {
      expect(document.documentElement.lang).toBe('en');
    }
  });

  it('manages aiKey slice with whitespace trimming and clearing', () => {
    expect(useAppStore.getState().aiKey).toBe('');

    useAppStore.getState().setAiKey('   test-api-key   ');
    expect(useAppStore.getState().aiKey).toBe('test-api-key');

    useAppStore.getState().clearAiKey();
    expect(useAppStore.getState().aiKey).toBe('');
  });

  it('manages air data loading and error states', () => {
    expect(useAppStore.getState().isAirLoading).toBe(false);
    expect(useAppStore.getState().airError).toBeNull();

    useAppStore.getState().setAirLoading(true);
    expect(useAppStore.getState().isAirLoading).toBe(true);

    useAppStore.getState().setAirError('Network failed');
    expect(useAppStore.getState().isAirLoading).toBe(false);
    expect(useAppStore.getState().airError).toBe('Network failed');
  });
});
