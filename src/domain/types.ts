export type AqiBand =
  | 'good'
  | 'moderate'
  | 'unhealthy_sensitive'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export interface AqiResult {
  readonly aqi: number;
  readonly band: AqiBand;
  readonly labelKey: string;
}

export type MemberRole = 'child' | 'adult' | 'elder';

export interface HouseholdMember {
  readonly id: string;
  readonly role: MemberRole;
  readonly hasRespiratoryCondition: boolean;
}

export type CommuteMode = 'commute_two_wheeler' | 'commute_walk' | 'commute_public' | 'commute_car';

export interface HouseholdProfile {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly members: readonly HouseholdMember[];
  readonly commuteMode?: CommuteMode | undefined;
  readonly hasAirPurifier?: boolean | undefined;
}

export type MicroEnvironment =
  | 'outdoor'
  | 'commute_walk'
  | 'commute_two_wheeler'
  | 'commute_car'
  | 'commute_public'
  | 'indoor_home'
  | 'indoor_work_school';

export type MaskType = 'none' | 'cloth' | 'surgical' | 'n95';
export type PurifierState = 'off' | 'on_room' | 'on_whole_house';

export interface ScenarioHour {
  readonly hour: number;
  readonly environment: MicroEnvironment;
  readonly mask: MaskType;
  readonly purifier: PurifierState;
  readonly windowsSealed: boolean;
  readonly cookingVentilated: boolean;
  readonly dampMopping: boolean;
  readonly biomassBurning: boolean;
}

export interface Scenario {
  readonly hours: readonly ScenarioHour[];
}

export interface HourlyReading {
  readonly hour: number;
  readonly pm25: number;
  readonly aqi: number;
}

export type HourlySeries = readonly HourlyReading[];

export interface ExposureInput {
  readonly hourly: HourlySeries;
  readonly profile: HouseholdProfile;
  readonly scenario: Scenario;
}

export interface MemberExposure {
  readonly memberId: string;
  readonly dailyDoseUg: number;
  readonly averageBreathedPm25: number;
  readonly cigaretteEquivalent: number;
  readonly riskBand: string;
}

export interface ExposureResult {
  readonly dailyDoseUg: number;
  readonly averageBreathedPm25: number;
  readonly cigaretteEquivalent: number;
  readonly memberExposures: readonly MemberExposure[];
}

export type ActionCategory = 'routine' | 'indoor' | 'sustainable' | 'community';
export type ActionId = string;

export interface ActionDef {
  readonly id: ActionId;
  readonly category: ActionCategory;
  readonly effort: 1 | 2 | 3;
  readonly costBand: 0 | 1 | 2 | 3;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly isQualitative?: boolean;
  readonly reasonKey?: string;
  readonly appliesTo: (profile: HouseholdProfile) => boolean;
  readonly apply: (scenario: Scenario) => Scenario;
}

export interface RankedAction {
  readonly action: ActionDef;
  readonly deltaDoseUg: number;
  readonly deltaPercent: number;
  readonly deltaCigaretteEq: number;
}

export type ActivityKind = 'exercise' | 'school_run' | 'ventilation';

export interface TimeWindow {
  readonly startHour: number;
  readonly endHour: number;
  readonly averagePm25: number;
  readonly labelKey: string;
}

export interface PlanInput {
  readonly hourly: HourlySeries;
  readonly profile: HouseholdProfile;
  readonly baselineScenario: Scenario;
}

export interface DayPlan {
  readonly baselineExposure: ExposureResult;
  readonly rankedActions: readonly RankedAction[];
  readonly optimizedScenario: Scenario;
  readonly optimizedExposure: ExposureResult;
  readonly bestWindows: readonly TimeWindow[];
  readonly generatedAt: string;
}

export interface AdvisoryInput {
  readonly aqi: number;
  readonly city: string;
  readonly dominantCategory: AqiBand;
}

export interface CommunityAdvisory {
  readonly city: string;
  readonly aqi: number;
  readonly band: AqiBand;
  readonly schoolOutdoorPermitted: boolean;
  readonly communityActions: readonly string[];
  readonly headlineKey: string;
  readonly adviceKey: string;
}
