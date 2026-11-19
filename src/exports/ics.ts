import type { TimeWindow } from '../domain/types';
import type { TranslationKey } from '../i18n';
import { translate } from '../i18n';
import type { GeneratedExport, IcsCalendarOptions, IcsEventInput } from './types';

/** Escapes reserved characters for RFC 5545 iCalendar TEXT property values. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds a single iCalendar content line to ensure no line exceeds 75 octets. */
export function foldIcsLine(line: string): string {
  const cleanLine = line.replace(/[\r\n]/g, '');
  const encoder = new TextEncoder();
  if (encoder.encode(cleanLine).length <= 75) return cleanLine;

  const lines: string[] = [];
  let currentLine = '';
  let currentBytes = 0;
  let isFirst = true;

  for (const char of cleanLine) {
    const charBytes = encoder.encode(char).length;
    const maxBytes = isFirst ? 75 : 74;

    if (currentBytes + charBytes > maxBytes) {
      lines.push(isFirst ? currentLine : ` ${currentLine}`);
      currentLine = char;
      currentBytes = charBytes;
      isFirst = false;
    } else {
      currentLine += char;
      currentBytes += charBytes;
    }
  }

  if (currentLine.length > 0) {
    lines.push(isFirst ? currentLine : ` ${currentLine}`);
  }
  return lines.join('\r\n');
}

/** Formats an ISO 8601 string or timestamp into RFC 5545 UTC date-time format. */
export function formatIcsDateTime(isoString: string): string {
  const cleaned = isoString.replace(/[-:]/g, '').replace(/\.\d{1,3}/, '');
  return cleaned.endsWith('Z') ? cleaned : `${cleaned}Z`;
}

/** Serializes a single calendar event object into an RFC 5545 VEVENT block. */
export function formatIcsEvent(event: IcsEventInput): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatIcsDateTime(event.dtstamp)}`,
    `DTSTART:${formatIcsDateTime(event.startUtc)}`,
    `DTEND:${formatIcsDateTime(event.endUtc)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];
  if (event.location && event.location.trim().length > 0) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  lines.push('END:VEVENT');
  return lines.map(foldIcsLine).join('\r\n');
}

function formatUtcHour(year: number, month: number, day: number, hour: number): string {
  const d = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dt = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  return `${d.getUTCFullYear()}${m}${dt}T${h}0000Z`;
}

function buildWindowEvent(
  opts: IcsCalendarOptions,
  y: number,
  m: number,
  d: number,
): IcsEventInput {
  const win: TimeWindow = opts.plan.bestWindows[0] ?? {
    startHour: 13,
    endHour: 15,
    averagePm25: 45,
    labelKey: 'window.exercise.optimal',
  };
  const label = translate(opts.language, win.labelKey as TranslationKey);
  const summary = opts.language === 'hi' ? `${label} (साँस)` : `${label} - Saans`;
  const description =
    opts.language === 'hi'
      ? `न्यूनतम वायु प्रदूषण समय (${win.startHour}:00 - ${win.endHour}:00)। औसत PM2.5: ${win.averagePm25} ug/m3।`
      : `Lowest ambient pollution window (${win.startHour}:00 - ${win.endHour}:00). Average PM2.5: ${win.averagePm25} ug/m3.`;
  return {
    uid: `${opts.idGen.nextId()}@saans.app`,
    dtstamp: opts.clock.iso(),
    startUtc: formatUtcHour(y, m, d, win.startHour),
    endUtc: formatUtcHour(y, m, d, win.endHour),
    summary,
    description,
    location: opts.cityName ?? 'Home',
  };
}

function buildReminderEvent(
  opts: IcsCalendarOptions,
  y: number,
  m: number,
  d: number,
): IcsEventInput {
  const summary =
    opts.language === 'hi'
      ? 'वायु गुणवत्ता चेतावनी: प्यूरीफायर चलाएं और खिड़कियां सील करें'
      : 'Air Quality Reminder: Run Purifier & Seal Windows';
  const description =
    opts.language === 'hi'
      ? 'शाम की धुंध से बचाव के लिए खिड़कियां बंद करें और HEPA प्यूरीफायर चलाएं।'
      : 'Evening smog inversion increases PM2.5. Seal windows and turn on air purifier.';
  return {
    uid: `${opts.idGen.nextId()}@saans.app`,
    dtstamp: opts.clock.iso(),
    startUtc: formatUtcHour(y, m, d, 20),
    endUtc: formatUtcHour(y, m, d, 21),
    summary,
    description,
    location: opts.cityName ?? 'Home',
  };
}

/** Generates an RFC 5545 compliant iCalendar export containing mitigation events and reminders. */
export function generateIcsCalendar(options: IcsCalendarOptions): GeneratedExport {
  const baseDate = options.clock.iso().slice(0, 10);
  const parts = baseDate.split('-');
  const y = Number(parts[0] ?? '2026');
  const m = Number(parts[1] ?? '1');
  const d = Number(parts[2] ?? '1');

  const events = [buildWindowEvent(options, y, m, d), buildReminderEvent(options, y, m, d)];

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Saans//Air Quality Copilot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
    .map(foldIcsLine)
    .join('\r\n');

  const body = events.map(formatIcsEvent).join('\r\n');
  const footer = foldIcsLine('END:VCALENDAR');
  const content = `${header}\r\n${body}\r\n${footer}\r\n`;

  return {
    filename: `saans-plan-${baseDate}.ics`,
    content,
    mimeType: 'text/calendar;charset=utf-8',
  };
}
