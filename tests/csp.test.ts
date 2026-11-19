import { describe, it, expect } from 'vitest';
import { CSP_DIRECTIVES, buildCspString } from '../src/config/csp';
import { vitePluginCsp } from '../vite-plugin-csp';

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
});
