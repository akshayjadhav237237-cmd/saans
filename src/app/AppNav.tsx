import React from 'react';
import { translate } from '../i18n';
import { useAppStore } from '../state/store';
import { NAV_TABS, type NavTabId } from './types';

export interface AppNavProps {
  readonly activeTab: NavTabId;
  readonly onSelectTab: (tabId: NavTabId) => void;
}

/** Accessible navigation landmark rendering ARIA-compliant tab controls for application feature panels. */
export function AppNav({ activeTab, onSelectTab }: AppNavProps): React.JSX.Element {
  const language = useAppStore((state) => state.language);

  return (
    <nav
      aria-label="Application Sections"
      className="border-b border-border bg-bg-surface px-4 sm:px-8 overflow-x-auto"
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="max-w-6xl mx-auto flex items-center space-x-1 sm:space-x-2 py-2 min-w-max"
      >
        {NAV_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus ${
                isActive
                  ? 'bg-teal text-text-inverse font-semibold shadow-sm'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-elevated'
              }`}
            >
              {translate(language, tab.labelKey)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
