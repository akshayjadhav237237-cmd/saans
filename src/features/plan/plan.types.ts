import type { ActionCategory } from '../../domain/types';

export interface ExposureMetricsDisplay {
  readonly doseUg: number;
  readonly doseFormatted: string;
  readonly cigEq: number;
  readonly cigFormatted: string;
  readonly avgBreathedPm25: number;
}

export interface ExposureComparisonViewModel {
  readonly baseline: ExposureMetricsDisplay;
  readonly optimized: ExposureMetricsDisplay;
  readonly deltaDoseUg: number;
  readonly deltaPercent: number;
  readonly disclaimer: string;
}

export interface MemberExposureViewModel {
  readonly memberId: string;
  readonly role: string;
  readonly roleLabel: string;
  readonly hasCondition: boolean;
  readonly baselineDoseUg: number;
  readonly optimizedDoseUg: number;
  readonly baselineRiskBand: string;
  readonly baselineRiskBandLabel: string;
  readonly optimizedRiskBand: string;
  readonly optimizedRiskBandLabel: string;
  readonly baselineCigEq: number;
  readonly optimizedCigEq: number;
}

export interface ActionItemViewModel {
  readonly id: string;
  readonly category: ActionCategory;
  readonly title: string;
  readonly description: string;
  readonly effort: 1 | 2 | 3;
  readonly effortLabel: string;
  readonly costBand: 0 | 1 | 2 | 3;
  readonly costLabel: string;
  readonly isQualitative: boolean;
  readonly deltaDoseUg: number;
  readonly deltaPercent: number;
  readonly impactLabel: string;
  readonly whyReason: string;
}

export interface ActionCategoryGroupViewModel {
  readonly category: ActionCategory;
  readonly categoryLabel: string;
  readonly actions: readonly ActionItemViewModel[];
}

export interface BestWindowViewModel {
  readonly startHour: number;
  readonly endHour: number;
  readonly timeRangeFormatted: string;
  readonly averagePm25: number;
  readonly avgFormatted: string;
  readonly label: string;
}

export interface PlanViewModel {
  readonly comparison: ExposureComparisonViewModel;
  readonly members: readonly MemberExposureViewModel[];
  readonly actionGroups: readonly ActionCategoryGroupViewModel[];
  readonly bestWindows: readonly BestWindowViewModel[];
}
