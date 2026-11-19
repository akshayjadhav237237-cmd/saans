import { describe, expect, it } from 'vitest';
import { createCounterIdGen } from '../src/domain/ports';
import type { ActionDef, DayPlan, HouseholdProfile } from '../src/domain/types';
import {
  escapeIcsText,
  foldIcsLine,
  formatIcsDateTime,
  formatIcsEvent,
  formatTextPlan,
  generateIcsCalendar,
  generateTextPlan,
} from '../src/exports';

const mockClock = { now: () => 1763539200000, iso: () => '2025-11-19T08:00:00.000Z' };

const exp = (dose: number, pm25: number, cig: number) => ({
  dailyDoseUg: dose,
  averageBreathedPm25: pm25,
  cigaretteEquivalent: cig,
  memberExposures: [],
});

const mockProfile: HouseholdProfile = {
  id: 'h_test',
  name: 'Sharma Family',
  city: 'Delhi',
  members: [{ id: 'm1', role: 'adult', hasRespiratoryCondition: false }],
};

const action: ActionDef = {
  id: 'purifier_bedroom',
  category: 'indoor',
  effort: 1,
  costBand: 2,
  titleKey: 'action.purifier_bedroom.title',
  descriptionKey: 'action.purifier_bedroom.desc',
  appliesTo: () => true,
  apply: (s) => s,
};

const win = { startHour: 13, endHour: 15, averagePm25: 65, labelKey: 'window.exercise.optimal' };

const mockPlan: DayPlan = {
  baselineExposure: exp(850, 140, 6.4),
  rankedActions: [{ action, deltaDoseUg: 340, deltaPercent: 40, deltaCigaretteEq: 2.6 }],
  optimizedScenario: { hours: [] },
  optimizedExposure: exp(510, 84, 3.8),
  bestWindows: [win],
  generatedAt: '2025-11-19T08:00:00.000Z',
};

const assertOctets = (s: string) =>
  s
    .split('\r\n')
    .filter((l) => l.length > 0)
    .forEach((l) => expect(Buffer.byteLength(l, 'utf8')).toBeLessThanOrEqual(75));

const genCal = (id: string, language: 'en' | 'hi', cityName: string) =>
  generateIcsCalendar({
    clock: mockClock,
    idGen: createCounterIdGen(id),
    plan: mockPlan,
    language,
    cityName,
  });

const planOpts = (language: 'en' | 'hi' = 'en', cityName = 'Delhi') => ({
  plan: mockPlan,
  language,
  profile: mockProfile,
  cityName,
});

const hasAll = (s: string, ...p: string[]) => p.forEach((x) => expect(s).toContain(x));

describe('ICS escaping and RFC 5545 line folding', () => {
  it('escapes reserved text characters according to RFC 5545', () => {
    expect(escapeIcsText('Smoke; dust, and fumes \\ toxic\nNew line')).toBe(
      'Smoke\\; dust\\, and fumes \\\\ toxic\\nNew line',
    );
  });

  it('preserves lines within the 75-octet limit without folding', () => {
    expect(foldIcsLine('SUMMARY:Quick outdoor window')).toBe('SUMMARY:Quick outdoor window');
  });

  it('folds lines exceeding 75 octets with CRLF and preserves code points', () => {
    const ascii = `DESCRIPTION:${'A'.repeat(80)}`;
    const hindi = 'DESCRIPTION:शाम की भारी धुंध और प्रदूषण से बचाव के लिए HEPA प्यूरीफायर चलाएं';
    for (const raw of [ascii, hindi]) {
      const folded = foldIcsLine(raw);
      expect(folded).toContain('\r\n ');
      assertOctets(folded);
      expect(folded.replace(/\r\n /g, '')).toBe(raw);
    }
  });

  it('formats ISO timestamps to RFC 5545 UTC representation', () => {
    expect(formatIcsDateTime('2025-11-19T08:00:00.000Z')).toBe('20251119T080000Z');
  });
});

describe('ICS event serialization and calendar generation', () => {
  it('formats individual VEVENT components with required fields', () => {
    const vEvent = formatIcsEvent({
      uid: 'ev1@saans.app',
      dtstamp: '20251119T080000Z',
      startUtc: '20251119T130000Z',
      endUtc: '20251119T150000Z',
      summary: 'Optimal Window',
      description: 'Lowest pollution window',
      location: 'Delhi',
    });
    hasAll(vEvent, 'BEGIN:VEVENT', 'UID:ev1@saans.app', 'END:VEVENT');
    hasAll(vEvent, 'SUMMARY:Optimal Window', 'LOCATION:Delhi');
  });

  it('generates a complete valid RFC 5545 calendar with CRLF endings', () => {
    const res = genCal('cal_ev', 'en', 'Delhi');
    expect(res.filename).toBe('saans-plan-2025-11-19.ics');
    expect(res.mimeType).toBe('text/calendar;charset=utf-8');
    expect(res.content).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(res.content).toMatch(/\r\nEND:VCALENDAR\r\n$/);
    expect(res.content.replace(/\r\n/g, '').includes('\n')).toBe(false);
    assertOctets(res.content);
    hasAll(res.content, 'UID:cal_ev_1@saans.app', 'UID:cal_ev_2@saans.app');
    hasAll(res.content, 'DTSTAMP:20251119T080000Z', 'SUMMARY:Optimal Exercise Window - Saans');
    expect(res.content).toContain('SUMMARY:Air Quality Reminder: Run Purifier & Seal Windows');
  });

  it('generates valid Hindi iCalendar meeting octet limits', () => {
    const res = genCal('hi_ev', 'hi', 'दिल्ली');
    expect(res.content).toContain('BEGIN:VCALENDAR');
    expect(res.content.replace(/\r\n /g, '')).toContain('प्यूरीफायर चलाएं');
    assertOctets(res.content);
  });
});

describe('Plain-text day plan export', () => {
  it('formats the complete day plan with numbers and mitigations in English', () => {
    const text = formatTextPlan(planOpts());
    hasAll(
      text,
      'SAANS',
      'Monitor Air Quality: Delhi',
      'Sharma Family',
      '850 ug/day',
      '510 ug/day',
    );
    hasAll(text, 'Today Baseline Exposure:', 'Projected Exposure with Plan:', '13:00 - 15:00');
    expect(text).toContain('Operate HEPA Purifier in Sleeping Area');
    expect(text).toContain('Air quality data: Open-Meteo, CAMS ENSEMBLE (Copernicus)');
  });

  it('formats the complete day plan in Hindi', () => {
    const text = formatTextPlan(planOpts('hi', 'दिल्ली'));
    hasAll(text, 'साँस', 'परिवार और दिनचर्या', '850', '510');
  });

  it('creates plain-text export object container', () => {
    const res = generateTextPlan(planOpts());
    expect(res.filename).toBe('saans-plan-2025-11-19.txt');
    expect(res.mimeType).toBe('text/plain;charset=utf-8');
    expect(res.content.length).toBeGreaterThan(100);
  });
});
