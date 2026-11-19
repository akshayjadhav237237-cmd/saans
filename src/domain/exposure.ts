import {
  BREATHING_RATES_M3_PER_HOUR,
  ENVIRONMENT_FACTORS,
  MASK_FILTRATION,
  PURIFIER_REDUCTION,
  INDOOR_MODIFIERS,
  CIGARETTE_EQUIVALENT_PM25_DIVISOR,
  PULMONARY_SENSITIVITY_WEIGHT,
} from '../config/exposure-constants';
import type {
  ExposureInput,
  ExposureResult,
  MemberExposure,
  HouseholdMember,
  ScenarioHour,
} from './types';

/** Calculates effective PM2.5 concentration in ug/m3 inhaled during a single hour. */
export function calculateEffectiveHourPm25(outdoorPm25: number, hour: ScenarioHour): number {
  let envFactor = ENVIRONMENT_FACTORS[hour.environment].value;
  let addedUg = 0;

  if (hour.environment === 'indoor_home') {
    if (hour.windowsSealed) {
      envFactor = Math.max(0.2, envFactor - INDOOR_MODIFIERS.sealedWindowsFactorReduction);
    }
    const purifierFactor = 1 - PURIFIER_REDUCTION[hour.purifier].value;
    envFactor *= purifierFactor;

    if (!hour.cookingVentilated) addedUg += INDOOR_MODIFIERS.unventilatedCookingAdditionUg;
    if (!hour.dampMopping) addedUg += INDOOR_MODIFIERS.drySweepingAdditionUg;
    if (hour.biomassBurning) addedUg += INDOOR_MODIFIERS.burningIncenseAdditionUg;
  }

  const baseAmbient = outdoorPm25 * envFactor + addedUg;
  const maskEfficiency = MASK_FILTRATION[hour.mask].value;
  return Math.max(0, baseAmbient * (1 - maskEfficiency));
}

/** Determines a descriptive risk tier based on daily inhaled PM2.5 dose in micrograms. */
export function evaluateRiskBand(doseUg: number, member: HouseholdMember): string {
  const sensitivityMultiplier =
    member.role !== 'adult' || member.hasRespiratoryCondition ? PULMONARY_SENSITIVITY_WEIGHT : 1.0;
  const weightedDose = doseUg * sensitivityMultiplier;
  if (weightedDose <= 300) return 'low';
  if (weightedDose <= 700) return 'moderate';
  if (weightedDose <= 1500) return 'high';
  return 'severe';
}

/** Calculates deterministic inhaled PM2.5 dosage for a household scenario across 24 hours. */
export function computeExposure(input: ExposureInput): ExposureResult {
  const hoursMap = new Map(input.hourly.map((h) => [h.hour, h.pm25]));
  const memberResults: MemberExposure[] = [];

  let totalDoseSum = 0;
  let totalBreathedSum = 0;

  for (const member of input.profile.members) {
    const breathingRate = BREATHING_RATES_M3_PER_HOUR[member.role].value;
    let memberDoseUg = 0;
    const totalVolume = breathingRate * 24;

    for (const sHour of input.scenario.hours) {
      const outdoorPm25 = hoursMap.get(sHour.hour) ?? 50;
      const effectivePm25 = calculateEffectiveHourPm25(outdoorPm25, sHour);
      memberDoseUg += effectivePm25 * breathingRate;
    }

    const roundedDose = Math.round(memberDoseUg);
    const avgBreathed = Math.round((roundedDose / totalVolume) * 10) / 10;
    const cigEq = Math.round((avgBreathed / CIGARETTE_EQUIVALENT_PM25_DIVISOR) * 10) / 10;
    const riskBand = evaluateRiskBand(roundedDose, member);

    memberResults.push({
      memberId: member.id,
      dailyDoseUg: roundedDose,
      averageBreathedPm25: avgBreathed,
      cigaretteEquivalent: cigEq,
      riskBand,
    });

    totalDoseSum += roundedDose;
    totalBreathedSum += avgBreathed;
  }

  const memberCount = Math.max(1, memberResults.length);
  const householdDose = Math.round(totalDoseSum / memberCount);
  const householdAvgBreathed = Math.round((totalBreathedSum / memberCount) * 10) / 10;
  const householdCigEq =
    Math.round((householdAvgBreathed / CIGARETTE_EQUIVALENT_PM25_DIVISOR) * 10) / 10;

  return {
    dailyDoseUg: householdDose,
    averageBreathedPm25: householdAvgBreathed,
    cigaretteEquivalent: householdCigEq,
    memberExposures: memberResults,
  };
}
