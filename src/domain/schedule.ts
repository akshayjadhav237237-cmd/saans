import type { ActivityKind, HourlySeries, TimeWindow } from './types';

interface ActivityConstraint {
  readonly allowedStartHours: readonly number[];
  readonly durationHours: number;
  readonly labelKey: string;
}

const ACTIVITY_CONSTRAINTS: Record<ActivityKind, ActivityConstraint> = {
  exercise: {
    allowedStartHours: [5, 6, 7, 8, 16, 17, 18, 19, 20],
    durationHours: 1,
    labelKey: 'window.exercise.optimal',
  },
  school_run: {
    allowedStartHours: [7, 8, 9, 13, 14, 15, 16],
    durationHours: 1,
    labelKey: 'window.school_run.optimal',
  },
  ventilation: {
    allowedStartHours: [11, 12, 13, 14, 15],
    durationHours: 2,
    labelKey: 'window.ventilation.optimal',
  },
};

/** Calculates average PM2.5 for a specific time window. */
function calculateWindowAverage(
  hourlyMap: Map<number, number>,
  startHour: number,
  duration: number,
): number {
  let sum = 0;
  for (let i = 0; i < duration; i += 1) {
    sum += hourlyMap.get(startHour + i) ?? 100;
  }
  return Math.round(sum / duration);
}

/** Identifies the lowest-exposure time windows for specific outdoor or ventilation activities. */
export function bestWindows(hourly: HourlySeries, kind: ActivityKind, count: number): TimeWindow[] {
  if (hourly.length === 0 || count <= 0) {
    return [];
  }

  const constraint = ACTIVITY_CONSTRAINTS[kind];
  const hourlyMap = new Map(hourly.map((h) => [h.hour, h.pm25]));
  const candidates: TimeWindow[] = [];

  for (const start of constraint.allowedStartHours) {
    const end = start + constraint.durationHours;
    if (end <= 24) {
      const avg = calculateWindowAverage(hourlyMap, start, constraint.durationHours);
      candidates.push({
        startHour: start,
        endHour: end,
        averagePm25: avg,
        labelKey: constraint.labelKey,
      });
    }
  }

  candidates.sort((a, b) => {
    if (a.averagePm25 !== b.averagePm25) {
      return a.averagePm25 - b.averagePm25;
    }
    return a.startHour - b.startHour;
  });

  const selected: TimeWindow[] = [];
  for (const cand of candidates) {
    const overlaps = selected.some(
      (s) => Math.max(s.startHour, cand.startHour) < Math.min(s.endHour, cand.endHour),
    );
    if (!overlaps) {
      selected.push(cand);
      if (selected.length >= count) {
        break;
      }
    }
  }

  return selected;
}
