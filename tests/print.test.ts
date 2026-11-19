import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

export interface ParsedRule {
  readonly selector: string;
  readonly properties: Record<string, string>;
}

/**
 * Parses CSS declarations into key-value property map.
 */
export function parseDeclarations(body: string): Record<string, string> {
  const properties: Record<string, string> = {};
  for (const decl of body.split(';')) {
    const colon = decl.indexOf(':');
    if (colon > 0) {
      const prop = decl.substring(0, colon).trim().toLowerCase();
      const val = decl.substring(colon + 1).trim();
      if (prop.length > 0 && val.length > 0) {
        properties[prop] = val;
      }
    }
  }
  return properties;
}

/**
 * Parses raw print CSS text into structured selector and property declarations.
 */
export function parsePrintCss(cssText: string): ParsedRule[] {
  const clean = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const mediaMatch = clean.match(/@media\s+print\s*\{([\s\S]*)\}\s*$/);
  const content = mediaMatch && mediaMatch[1] ? mediaMatch[1] : clean;
  const rules: ParsedRule[] = [];
  const regex = /([^{}]+)\{([^{}]+)\}/g;
  let match = regex.exec(content);

  while (match !== null) {
    const selector = match[1] ? match[1].trim() : '';
    const body = match[2] ? match[2].trim() : '';
    if (selector.length > 0 && body.length > 0) {
      rules.push({ selector, properties: parseDeclarations(body) });
    }
    match = regex.exec(content);
  }
  return rules;
}

/**
 * Resolves the matching property value for an element from parsed CSS rules.
 */
export function findMatchingProperty(
  element: HTMLElement,
  rules: readonly ParsedRule[],
  propertyName: string,
): string | undefined {
  let matchedValue: string | undefined;
  for (const rule of rules) {
    const selectors = rule.selector.split(',').map((s) => s.trim());
    for (const sel of selectors) {
      if (sel.length === 0 || sel.startsWith('@') || sel.includes('::')) {
        continue;
      }
      try {
        if (element.matches(sel)) {
          const val = rule.properties[propertyName.toLowerCase()];
          if (val !== undefined) {
            matchedValue = val;
          }
        }
      } catch {
        // Ignore pseudo-selectors that DOM matches cannot evaluate
      }
    }
  }
  return matchedValue;
}

describe('Print Stylesheet Layout & Rules', () => {
  const cssPath = path.resolve(process.cwd(), 'src/styles/print.css');
  const cssText = fs.readFileSync(cssPath, 'utf-8');
  const rules = parsePrintCss(cssText);

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('successfully loads print stylesheet and parses rules', () => {
    expect(cssText.length).toBeGreaterThan(0);
    expect(rules.length).toBeGreaterThan(5);
  });

  it('hides navigation landmarks, tablists, and skip links in print layout', () => {
    const nav = document.createElement('nav');
    nav.className = 'app-nav';
    const tablist = document.createElement('div');
    tablist.setAttribute('role', 'tablist');
    const skipLink = document.createElement('a');
    skipLink.setAttribute('href', '#main-content');
    const noPrint = document.createElement('div');
    noPrint.className = 'no-print';

    expect(findMatchingProperty(nav, rules, 'display')).toContain('none');
    expect(findMatchingProperty(tablist, rules, 'display')).toContain('none');
    expect(findMatchingProperty(skipLink, rules, 'display')).toContain('none');
    expect(findMatchingProperty(noPrint, rules, 'display')).toContain('none');
  });

  it('hides interactive buttons, form controls, and chart toggles/ads', () => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    const input = document.createElement('input');
    const chartControls = document.createElement('div');
    chartControls.className = 'chart-controls';
    const chartToggle = document.createElement('div');
    chartToggle.className = 'chart-toggle';

    expect(findMatchingProperty(btn, rules, 'display')).toContain('none');
    expect(findMatchingProperty(input, rules, 'display')).toContain('none');
    expect(findMatchingProperty(chartControls, rules, 'display')).toContain('none');
    expect(findMatchingProperty(chartToggle, rules, 'display')).toContain('none');
  });

  it('displays community advisory and day plan panels prominently', () => {
    const advisory = document.createElement('section');
    advisory.id = 'community-advisory';
    advisory.className = 'community-advisory';
    const plan = document.createElement('section');
    plan.id = 'exposure-plan';
    plan.className = 'exposure-plan';

    expect(findMatchingProperty(advisory, rules, 'display')).toContain('block');
    expect(findMatchingProperty(plan, rules, 'display')).toContain('block');
  });

  it('preserves authoritative footer attribution and marks it visible', () => {
    const footer = document.createElement('footer');
    footer.setAttribute('role', 'contentinfo');
    footer.className = 'app-footer';

    expect(findMatchingProperty(footer, rules, 'display')).toContain('block');
    expect(findMatchingProperty(footer, rules, 'border-top')).toContain('1px solid');
  });

  it('enforces black-on-white palette and removes drop shadows', () => {
    const bodyRule = rules.find((r) => r.selector.includes('body'));
    expect(bodyRule).toBeDefined();
    if (bodyRule) {
      expect(bodyRule.properties['background-color']).toContain('#ffffff');
      expect(bodyRule.properties['color']).toContain('#000000');
    }

    const universalRule = rules.find((r) => r.selector.includes('*'));
    expect(universalRule).toBeDefined();
    if (universalRule) {
      expect(universalRule.properties['box-shadow']).toContain('none');
    }
  });

  it('enforces sensible page-break constraints on cards and headings', () => {
    const card = document.createElement('div');
    card.className = 'card';
    const heading = document.createElement('h2');

    expect(findMatchingProperty(card, rules, 'break-inside')).toContain('avoid');
    expect(findMatchingProperty(heading, rules, 'break-after')).toContain('avoid');
  });

  it('verifies jsdom parses the print CSS into standard styleSheet rules without syntax errors', () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);

    expect(styleEl.sheet).toBeDefined();
    const sheetRules = styleEl.sheet?.cssRules;
    expect(sheetRules).toBeDefined();
    expect(sheetRules?.length).toBeGreaterThan(0);
    document.head.removeChild(styleEl);
  });
});
