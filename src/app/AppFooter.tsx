import React from 'react';
import { APP_CONFIG } from '../config/constants';

/**
 * Accessible footer landmark rendering authoritative data attribution and project provenance.
 */
export function AppFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-border bg-bg-surface px-4 py-6 text-center text-xs text-text-muted sm:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>{APP_CONFIG.attributionText}</p>
        <p className="text-text-muted">
          Saans &bull; Deterministic PM2.5 Inhalation Exposure Copilot
        </p>
      </div>
    </footer>
  );
}
