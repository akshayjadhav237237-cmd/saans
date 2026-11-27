import React, { useRef } from 'react';
import { translate } from '../i18n';
import { useAppStore } from '../state/store';
import { NAV_TABS, type NavTabId } from './types';

export interface AppNavProps {
  readonly activeTab: NavTabId;
  readonly onSelectTab: (tabId: NavTabId) => void;
}

/** Computes the next tab index for horizontal WAI-ARIA arrow, Home, and End navigation. */
export function getNextTabIndex(currentIndex: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
      return (currentIndex + 1) % count;
    case 'ArrowLeft':
      return (currentIndex - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** Accessible navigation landmark implementing WAI-ARIA roving tabindex across section tabs. */
export function AppNav({ activeTab, onSelectTab }: AppNavProps): React.JSX.Element {
  const language = useAppStore((state) => state.language);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    tabId: NavTabId,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectTab(tabId);
      return;
    }
    const nextIdx = getNextTabIndex(index, event.key, NAV_TABS.length);
    if (nextIdx === null) return;
    const nextTab = NAV_TABS[nextIdx];
    if (!nextTab) return;
    event.preventDefault();
    onSelectTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

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
        {NAV_TABS.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index, tab.id)}
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
