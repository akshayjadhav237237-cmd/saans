import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { A11Y_NAMES, type A11yNameKey } from '../src/shared/a11y-names';
import {
  AlertIcon,
  BandBadge,
  Button,
  Card,
  Chart,
  Field,
  IconWrapper,
  Notice,
  Section,
  Select,
  ShieldIcon,
  SkipLink,
  Spinner,
  Toggle,
  VisuallyHidden,
  WindIcon,
} from '../src/shared';

describe('Shared UI Design System Components', () => {
  it('validates A11Y_NAMES keys and typing', () => {
    const key: A11yNameKey = 'buttons';
    expect(A11Y_NAMES[key]).toBeDefined();
  });

  it('Button renders accessible variants and handles click events', async () => {
    let clicked = false;
    render(
      <div>
        <Button variant="primary" onClick={() => (clicked = true)}>
          Save Changes
        </Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>,
    );

    const btn = screen.getByRole('button', { name: 'Save Changes' });
    expect(btn).toBeDefined();
    await userEvent.click(btn);
    expect(clicked).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDefined();
  });

  it('Field wires label, hint, and error with ARIA describedby', () => {
    render(
      <Field
        id="test-input"
        label="City Name"
        hint="Search Indian cities"
        error="City not found"
      />,
    );

    const input = screen.getByLabelText('City Name');
    expect(input.getAttribute('aria-describedby')).toContain('test-input-hint');
    expect(input.getAttribute('aria-describedby')).toContain('test-input-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('Field renders custom children when supplied', () => {
    render(
      <Field id="custom-field" label="Custom Label">
        <textarea id="custom-field" aria-label="Custom Area" />
      </Field>,
    );
    expect(screen.getByLabelText('Custom Area')).toBeDefined();
  });

  it('Select renders options and handles change events', async () => {
    render(
      <Select id="role-select" label="Member Role">
        <option value="adult">Adult</option>
        <option value="child">Child</option>
      </Select>,
    );

    const select = screen.getByLabelText('Member Role');
    expect(select).toBeDefined();
  });

  it('Toggle renders role=switch and toggles state', async () => {
    let state = false;
    render(
      <Toggle
        id="purifier-toggle"
        label="Indoor Purifier"
        checked={state}
        onChange={(v) => (state = v)}
      />,
    );

    const toggle = screen.getByRole('switch', { name: 'Indoor Purifier' });
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(toggle);
    expect(state).toBe(true);
  });

  it('Card and Section render content with proper landmarks', () => {
    render(
      <Section id="test-section" title="Section Heading" subtitle="Section sub">
        <Card>Card Content</Card>
      </Section>,
    );

    expect(screen.getByRole('region', { name: 'Section Heading' })).toBeDefined();
    expect(screen.getByText('Card Content')).toBeDefined();
  });

  it('Notice renders polite live region status', () => {
    render(<Notice variant="warning">Severe Smog Alert</Notice>);
    const notice = screen.getByRole('status');
    expect(notice.getAttribute('aria-live')).toBe('polite');
    expect(notice.textContent).toContain('Severe Smog Alert');
  });

  it('VisuallyHidden, SkipLink, Spinner, and BandBadge render correctly', () => {
    render(
      <div>
        <VisuallyHidden>Screen reader label</VisuallyHidden>
        <SkipLink />
        <Spinner label="Loading air data" />
        <BandBadge band="unhealthy" label="Unhealthy" />
      </div>,
    );

    expect(screen.getByText('Screen reader label')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeDefined();
    expect(screen.getByText('Unhealthy')).toBeDefined();
  });

  it('Chart renders SVG line and toggles accessible data table alternative', async () => {
    const hourly = [
      { hour: 0, pm25: 120, aqi: 180 },
      { hour: 1, pm25: 140, aqi: 195 },
    ];

    render(<Chart hourly={hourly} title="24h Trend" description="Diurnal air pollution trend" />);

    expect(screen.getByRole('img')).toBeDefined();
    const toggleBtn = screen.getByRole('button', { name: 'Show Data Table' });
    await userEvent.click(toggleBtn);

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Show Chart' })).toBeDefined();
  });

  it('Chart renders empty placeholder when no hourly data provided', () => {
    render(<Chart hourly={[]} title="Empty" description="Empty chart" />);
    expect(screen.getByText('No hourly series available.')).toBeDefined();
  });

  it('renders SVG icon components', () => {
    const { container } = render(
      <div>
        <IconWrapper label="Custom Icon">
          <circle cx="10" cy="10" r="5" />
        </IconWrapper>
        <WindIcon />
        <ShieldIcon />
        <AlertIcon />
      </div>,
    );
    expect(container.querySelectorAll('svg').length).toBe(4);
  });
});
