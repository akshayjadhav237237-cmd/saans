import { describe, expect, it } from 'vitest';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('WCAG 2.1 AA Palette Contrast Ratios', () => {
  const textPairs = [
    { name: 'Text Main on Base Background', fg: '#0f172a', bg: '#f8fafc' },
    { name: 'Text Main on Surface Background', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Text Main on Elevated Background', fg: '#0f172a', bg: '#f1f5f9' },
    { name: 'Text Muted on Base Background', fg: '#475569', bg: '#f8fafc' },
    { name: 'Text Muted on Surface Background', fg: '#475569', bg: '#ffffff' },
    { name: 'Text Inverse on Teal Primary Button', fg: '#ffffff', bg: '#0f766e' },
    { name: 'Text Inverse on Teal Dark Button', fg: '#ffffff', bg: '#115e59' },
    { name: 'Amber Dark on Amber Light Badge', fg: '#92400e', bg: '#fef3c7' },
    { name: 'Teal Dark on Teal Light Badge', fg: '#115e59', bg: '#ccfbf1' },
  ];

  const uiPairs = [
    { name: 'Teal Focus Border on Surface Background', fg: '#0f766e', bg: '#ffffff' },
    { name: 'Teal Focus Border on Base Background', fg: '#0f766e', bg: '#f8fafc' },
    { name: 'Teal Interactive Indicator on Elevated', fg: '#0f766e', bg: '#f1f5f9' },
  ];

  it('verifies all typography pairs meet WCAG AA normal text contrast >= 4.5:1', () => {
    for (const pair of textPairs) {
      const ratio = getContrastRatio(pair.fg, pair.bg);
      expect(
        ratio,
        `Expected ratio >= 4.5 for ${pair.name} (${pair.fg} on ${pair.bg}), got ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('verifies all UI controls and focus outlines meet WCAG AA UI contrast >= 3.0:1', () => {
    for (const pair of uiPairs) {
      const ratio = getContrastRatio(pair.fg, pair.bg);
      expect(
        ratio,
        `Expected ratio >= 3.0 for ${pair.name} (${pair.fg} on ${pair.bg}), got ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(3.0);
    }
  });
});
