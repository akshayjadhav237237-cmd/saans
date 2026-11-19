import React from 'react';
import { APP_CONFIG } from '../config/constants';

/**
 * Primary accessible application shell component for Saans.
 */
export function App(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-main">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:p-3 focus:bg-teal focus:text-text-inverse focus:z-50 focus:rounded"
      >
        Skip to main content
      </a>

      <header className="border-b border-border bg-bg-surface px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span aria-hidden="true" className="text-2xl font-bold text-teal">
              🍃
            </span>
            <h1 className="text-xl font-bold tracking-tight text-text-main">
              {APP_CONFIG.appName}
            </h1>
          </div>
          <span className="text-xs text-text-muted">v{APP_CONFIG.appVersion}</span>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        <section aria-labelledby="overview-heading" className="space-y-4">
          <h2 id="overview-heading" className="text-2xl font-semibold text-text-main">
            Urban Air Quality Assistant
          </h2>
          <p className="text-text-muted leading-relaxed max-w-2xl">
            Deterministic personalized PM2.5 exposure budgeting and actionable smog mitigations for
            families.
          </p>
        </section>
      </main>

      <footer className="border-t border-border bg-bg-surface px-4 py-6 text-center text-xs text-text-muted sm:px-8">
        <p className="max-w-6xl mx-auto">{APP_CONFIG.attributionText}</p>
      </footer>
    </div>
  );
}
