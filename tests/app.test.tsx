import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../src/app/App';

describe('Accessible Application Shell', () => {
  it('renders standard document landmarks', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
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
});
