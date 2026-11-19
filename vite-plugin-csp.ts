import type { Plugin } from 'vite';
import { buildCspString } from './src/config/csp';

/**
 * Injects Content-Security-Policy meta tag as the first child of <head>.
 */
export function vitePluginCsp(): Plugin {
  return {
    name: 'vite-plugin-csp',
    transformIndexHtml(html: string): string {
      const cspString = buildCspString();
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
      return html.replace(/<head[^>]*>/i, (match) => `${match}\n    ${metaTag}`);
    },
  };
}
