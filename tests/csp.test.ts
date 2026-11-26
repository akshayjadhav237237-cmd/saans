import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { buildCspString, CSP_DIRECTIVES } from '../src/config/csp';
import { vitePluginCsp } from '../vite-plugin-csp';

interface VercelHeaderItem {
  readonly key: string;
  readonly value: string;
}

interface VercelConfig {
  readonly headers?: readonly {
    readonly source: string;
    readonly headers: readonly VercelHeaderItem[];
  }[];
}

function getVercelHeaders(): Record<string, string> {
  const raw = readFileSync(resolve(__dirname, '../vercel.json'), 'utf8');
  const parsed = JSON.parse(raw) as VercelConfig;
  const headerList = parsed.headers?.[0]?.headers ?? [];
  return Object.fromEntries(headerList.map((h) => [h.key, h.value]));
}

describe('Content Security Policy configuration', () => {
  it('defines required restrictive security directives', () => {
    expect(CSP_DIRECTIVES['default-src']).toContain("'none'");
    expect(CSP_DIRECTIVES['script-src']).toContain("'self'");
    expect(CSP_DIRECTIVES['style-src']).toContain("'self'");
    expect(CSP_DIRECTIVES['connect-src']).toContain('https://air-quality-api.open-meteo.com');
    expect(CSP_DIRECTIVES['connect-src']).toContain('https://generativelanguage.googleapis.com');
  });

  it('serializes policy into valid meta header string format', () => {
    const csp = buildCspString();
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self' https://air-quality-api.open-meteo.com");
  });

  it('injects CSP meta tag as first child in head during build transformation', () => {
    const plugin = vitePluginCsp();
    const mockHtml = '<!doctype html><html><head><title>Test</title></head><body></body></html>';
    if (typeof plugin.transformIndexHtml === 'function') {
      const transformed = plugin.transformIndexHtml.call({} as never, mockHtml, {} as never);
      if (typeof transformed === 'string') {
        expect(transformed).toContain('<meta http-equiv="Content-Security-Policy"');
        const headIdx = transformed.indexOf('<head>');
        const metaIdx = transformed.indexOf('<meta http-equiv="Content-Security-Policy"');
        const titleIdx = transformed.indexOf('<title>');
        expect(metaIdx).toBeGreaterThan(headIdx);
        expect(metaIdx).toBeLessThan(titleIdx);
      }
    }
  });

  it('matches vercel.json CSP with buildCspString and contains frame-ancestors none', () => {
    const headers = getVercelHeaders();
    const vercelCsp = headers['Content-Security-Policy'] ?? '';
    expect(vercelCsp).toContain("frame-ancestors 'none'");
    const baseCsp = vercelCsp.replace("; frame-ancestors 'none'", '');
    expect(baseCsp).toBe(buildCspString());
  });

  it('enforces expected HTTP security headers in vercel.json', () => {
    const headers = getVercelHeaders();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('no-referrer');
    expect(headers['Permissions-Policy']).toBeDefined();
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Strict-Transport-Security']).toBeDefined();
    expect(headers['Strict-Transport-Security']).toContain('max-age=');
  });
});
