import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AirQualityData } from '../src/data/types';
import { buildDayPlan } from '../src/domain/plan';
import type { Clock } from '../src/domain/ports';
import type { HouseholdProfile } from '../src/domain/types';
import {
  buildPlanViewModel,
  createDefaultBaselineScenario,
  buildActionGroupViewModels,
  buildBestWindowViewModels,
  buildComparisonViewModel,
  buildMemberViewModels,
  PlanPanel,
} from '../src/features/plan';
import { useAppStore } from '../src/state/store';

describe('Plan Feature - Viewmodel & PlanPanel UI', () => {
  const mockClock: Clock = {
    now: () => 1763539200000,
    iso: () => '2026-11-19T08:00:00.000Z',
  };

  const mockProfile: HouseholdProfile = {
    id: 'h_test',
    name: 'Verma Family',
    city: 'Delhi',
    members: [
      { id: 'm_adult', role: 'adult', hasRespiratoryCondition: false },
      { id: 'm_child', role: 'child', hasRespiratoryCondition: true },
    ],
  };

  const mockAirData: AirQualityData = {
    currentAqi: 280,
    currentPm25: 230,
    hourly: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      pm25: hour >= 11 && hour <= 14 ? 70 : 240,
      aqi: hour >= 11 && hour <= 14 ? 150 : 290,
    })),
  };

  beforeEach(() => {
    useAppStore.setState({
      airData: null,
      profile: mockProfile,
      language: 'en',
      plan: null,
      isAirLoading: false,
    });
  });

  it('buildPlanViewModel correctly maps exposure comparisons, heuristic disclaimer, and action groups', () => {
    const plan = buildDayPlan(
      {
        hourly: mockAirData.hourly,
        profile: mockProfile,
        baselineScenario: createDefaultBaselineScenario(),
      },
      mockClock,
    );

    const vm = buildPlanViewModel(plan, mockProfile, 'en');

    expect(vm.comparison.baseline.doseUg).toBeGreaterThan(vm.comparison.optimized.doseUg);
    expect(vm.comparison.deltaPercent).toBeGreaterThan(0);
    expect(vm.comparison.disclaimer).toContain('Rough heuristic');
    expect(vm.comparison.disclaimer).toContain('Not medical advice');

    expect(vm.members).toHaveLength(2);
    const child = vm.members.find((m) => m.role === 'child');
    expect(child?.hasCondition).toBe(true);
    expect(child?.baselineRiskBand).toBeDefined();

    expect(vm.actionGroups.length).toBeGreaterThan(0);
    const allActions = vm.actionGroups.flatMap((g) => g.actions);
    const quantitative = allActions.filter((a) => !a.isQualitative);
    expect(quantitative.length).toBeGreaterThan(0);
    const firstQuant = quantitative[0];
    expect(firstQuant?.impactLabel).toContain('Impact: About');
    expect(firstQuant?.impactLabel).toContain('less inhaled PM2.5');

    const qualitative = allActions.filter((a) => a.isQualitative);
    expect(qualitative.length).toBeGreaterThan(0);
    const firstQual = qualitative[0];
    expect(firstQual?.impactLabel).toContain('Qualitative / Indirect');

    expect(firstQuant?.effortLabel).toMatch(/Effort: Level \d/);
    expect(firstQuant?.costLabel).toMatch(/Cost: Tier \d/);
    expect(vm.bestWindows.length).toBeGreaterThan(0);
  });

  it('renders empty state guide when air quality data is unconfigured', () => {
    render(<PlanPanel clock={mockClock} />);
    expect(
      screen.getByText(
        /Complete location and household profile to generate your customized exposure budget/i,
      ),
    ).toBeDefined();
  });

  it('renders complete exposure budget, ranked actions, and heuristic disclaimer when configured', () => {
    useAppStore.setState({ airData: mockAirData });
    render(<PlanPanel clock={mockClock} />);

    expect(screen.getByText('Today Baseline Exposure')).toBeDefined();
    expect(screen.getByText('Projected Exposure with Plan')).toBeDefined();
    expect(
      screen.getByText(
        /Rough heuristic \(Berkeley Earth rule: 22 ug\/m3 avg ~ 1 cig\/day\)\. Not medical advice\./i,
      ),
    ).toBeDefined();

    expect(screen.getByText(/Child \(under 14\)/i)).toBeDefined();
    expect(screen.getByText('(sensitive)')).toBeDefined();
    expect(screen.getByText('Ranked Mitigation Actions')).toBeDefined();
  });

  it('toggles accessible "Why this works" expansion state when clicked', async () => {
    useAppStore.setState({ airData: mockAirData });
    render(<PlanPanel clock={mockClock} />);

    const whyButtons = screen.getAllByRole('button', { name: /Why this works/i });
    expect(whyButtons.length).toBeGreaterThan(0);
    const firstBtn = whyButtons[0];
    expect(firstBtn).toBeDefined();

    if (firstBtn) {
      expect(firstBtn.getAttribute('aria-expanded')).toBe('false');
      await userEvent.click(firstBtn);
      expect(firstBtn.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getAllByText(/Mechanism:/i).length).toBeGreaterThan(0);

      await userEvent.click(firstBtn);
      expect(firstBtn.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('renders best windows and diurnal chart with accessible data table toggle', async () => {
    useAppStore.setState({ airData: mockAirData });
    render(<PlanPanel clock={mockClock} />);

    expect(screen.getByText('Best Outdoor & Ventilation Windows')).toBeDefined();
    expect(screen.getByRole('img')).toBeDefined();

    const showTableBtn = screen.getByRole('button', { name: 'Show Data Table' });
    await userEvent.click(showTableBtn);

    const table = screen.getByRole('table', { name: '24-Hour Diurnal PM2.5 Forecast' });
    expect(table).toBeDefined();
    expect(screen.getByRole('button', { name: 'Show Chart' })).toBeDefined();
  });

  it('directly verifies individual viewmodel builders', () => {
    const plan = buildDayPlan(
      {
        hourly: mockAirData.hourly,
        profile: mockProfile,
        baselineScenario: createDefaultBaselineScenario(),
      },
      mockClock,
    );
    const comp = buildComparisonViewModel(plan.baselineExposure, plan.optimizedExposure, 'en');
    const members = buildMemberViewModels(plan, mockProfile, 'en');
    const groups = buildActionGroupViewModels(plan.rankedActions, 'en');
    const windows = buildBestWindowViewModels(plan.bestWindows, 'en');

    expect(comp.baseline.doseUg).toBeGreaterThan(0);
    expect(members.length).toBe(2);
    expect(groups.length).toBeGreaterThan(0);
    expect(windows.length).toBeGreaterThan(0);
  });
});
