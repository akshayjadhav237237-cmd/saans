import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { App } from '../src/app/App';
import type { NavTabItem } from '../src/app/types';
import { useAppStore, type AppState } from '../src/state/store';

describe('Accessible Application Shell', () => {
  beforeEach(() => {
    useAppStore.setState({
      language: 'en',
      airData: null,
      plan: null,
      aiKey: '',
    });
  });

  it('renders standard document landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /application sections/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('provides a functional skip link targeting the main content landmark', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('displays accurate data source attribution in the footer', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toContain('Air quality data: Open-Meteo');
  });

  it('toggles language between English and Hindi when language switcher is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const langBtn = screen.getByRole('button', { name: 'हिंदी में देखें' });
    expect(langBtn.textContent).toContain('हिंदी में देखें');

    await user.click(langBtn);
    expect(useAppStore.getState().language).toBe('hi');
    expect(screen.getByRole('button', { name: 'View in English' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('hi');

    await user.click(langBtn);
    expect(useAppStore.getState().language).toBe('en');
    expect(langBtn.textContent).toContain('हिंदी में देखें');
    expect(document.documentElement.lang).toBe('en');
  });

  it('navigates across feature panels via accessible tab controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    const locationTab = screen.getByRole('tab', { name: /location & air/i });
    const householdTab = screen.getByRole('tab', { name: /household profile/i });
    const planTab = screen.getByRole('tab', { name: /exposure budget & plan/i });

    expect(locationTab).toHaveAttribute('aria-selected', 'true');
    expect(householdTab).toHaveAttribute('aria-selected', 'false');

    await user.click(householdTab);
    expect(householdTab).toHaveAttribute('aria-selected', 'true');
    expect(locationTab).toHaveAttribute('aria-selected', 'false');

    await user.click(planTab);
    expect(planTab).toHaveAttribute('aria-selected', 'true');
  });

  it('validates shell types', () => {
    const tab: NavTabItem = {
      id: 'location',
      labelKey: 'app.nav.location',
      panelHeadingId: 'location-heading',
    };
    expect(tab.id).toBe('location');
    const state: Partial<AppState> = { language: 'en' };
    expect(state.language).toBe('en');
  });
});
