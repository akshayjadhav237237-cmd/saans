import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildAdvisory } from '../src/domain/advisory';
import {
  CommunityPanel,
  toBandLabel,
  toCommunityActions,
  toCommunityViewModel,
  toSchoolStatusDisplay,
} from '../src/features/community';
import { A11Y_NAMES } from '../src/shared/a11y-names';
import { useAppStore } from '../src/state/store';

describe('Community ViewModel & UI Feature', () => {
  beforeEach(() => {
    useAppStore.setState({
      language: 'en',
      airData: null,
      selectedCity: null,
    });
  });

  it('correctly maps school outdoor status display and high-contrast badges', () => {
    const permitted = toSchoolStatusDisplay(true, 'en');
    expect(permitted.isPermitted).toBe(true);
    expect(permitted.badge).toBe('PERMITTED');
    expect(permitted.statusText).toContain('PERMITTED');

    const restricted = toSchoolStatusDisplay(false, 'en');
    expect(restricted.isPermitted).toBe(false);
    expect(restricted.badge).toBe('RESTRICTED');
    expect(restricted.statusText).toContain('RESTRICTED');

    const permittedHi = toSchoolStatusDisplay(true, 'hi');
    expect(permittedHi.statusText).toContain('अनुमति है');
  });

  it('translates community actions list into display items', () => {
    const actions = toCommunityActions(
      ['advisory.action.wet_sweeping', 'advisory.action.stagger_office_hours'],
      'en',
    );
    expect(actions).toHaveLength(2);
    expect(actions[0]?.text).toContain('wet sweeping');
    expect(actions[0]?.description).toBe(actions[0]?.text);

    const actionsHi = toCommunityActions(['advisory.action.wet_sweeping'], 'hi');
    expect(actionsHi[0]?.text).toContain('गीली सफाई');
  });

  it('resolves localized AQI band labels', () => {
    expect(toBandLabel('good', 'en')).toBe('Good');
    expect(toBandLabel('unhealthy', 'en')).toBe('Unhealthy');
    expect(toBandLabel('good', 'hi')).toContain('अच्छा');
  });

  it('translates domain CommunityAdvisory into comprehensive ViewModel', () => {
    const advisory = buildAdvisory({ aqi: 180, city: 'Delhi', dominantCategory: 'unhealthy' });
    const vm = toCommunityViewModel(advisory, 'en');
    expect(vm.city).toBe('Delhi');
    expect(vm.aqi).toBe(180);
    expect(vm.band).toBe('unhealthy');
    expect(vm.headline).toBe('Unhealthy Air Episode');
    expect(vm.advice).toContain('Everyone may begin to experience health effects');
    expect(vm.schoolStatus.badge).toBe('RESTRICTED');
    expect(vm.actions.length).toBeGreaterThan(0);
  });

  it('renders institutional advisory header with city and AQI BandBadge', () => {
    render(<CommunityPanel overrides={{ city: 'Gurugram', aqi: 45 }} />);
    expect(screen.getByText('Gurugram')).toBeDefined();
    expect(screen.getByText('AQI 45')).toBeDefined();
    expect(screen.getByText('Good')).toBeDefined();
    expect(screen.getByText('Air Quality is Satisfactory')).toBeDefined();
  });

  it('renders school outdoor threshold card with PERMITTED badge in Good air quality', () => {
    render(<CommunityPanel overrides={{ city: 'Delhi', aqi: 40 }} />);
    expect(screen.getByText('PERMITTED')).toBeDefined();
    expect(screen.getByText(/School Outdoor Sports & Assemblies/i)).toBeDefined();
  });

  it('renders school outdoor threshold card with RESTRICTED badge in Unhealthy air quality', () => {
    render(<CommunityPanel overrides={{ city: 'Delhi', aqi: 180 }} />);
    expect(screen.getByText('RESTRICTED')).toBeDefined();
    expect(screen.getByText(/Avoid heavy outdoor student exertion/i)).toBeDefined();
  });

  it('renders recommended collective civic and RWA actions list', () => {
    render(<CommunityPanel overrides={{ city: 'Noida', aqi: 220 }} />);
    expect(screen.getByText('Recommended Collective Civic Actions')).toBeDefined();
    expect(screen.getByText(/Mandate mechanical wet sweeping/i)).toBeDefined();
    expect(screen.getByText(/50% remote work-from-home/i)).toBeDefined();
  });

  it('renders print advisory button and triggers window.print when clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<CommunityPanel overrides={{ city: 'Delhi', aqi: 180 }} />);
    const printBtn = screen.getByRole('button', { name: A11Y_NAMES.buttons.printAdvisory });
    expect(printBtn).toBeDefined();
    await userEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('responds dynamically to language toggle between English and Hindi', () => {
    const { rerender } = render(<CommunityPanel overrides={{ city: 'Delhi', aqi: 180 }} />);
    expect(screen.getByText('Unhealthy Air Episode')).toBeDefined();

    useAppStore.getState().setLanguage('hi');
    rerender(<CommunityPanel overrides={{ city: 'Delhi', aqi: 180 }} />);

    expect(screen.getByText('सामुदायिक एवं संस्थागत सलाह')).toBeDefined();
    expect(screen.getByText('अस्वस्थ वायु गुणवत्ता का दौर')).toBeDefined();
    expect(screen.getByText('स्कूल खेलकूद और बाहरी प्रार्थना सभा:')).toBeDefined();
  });
});
