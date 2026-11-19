import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { SkipLink, Spinner } from '../shared';
import { loadPersistedState, savePersistedState } from '../state/persist';
import { useAppStore } from '../state/store';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { AppNav } from './AppNav';
import { NAV_TABS, type NavTabId } from './types';

const LocationPanel = React.lazy(() =>
  import('../features/location/LocationPanel').then((m) => ({ default: m.LocationPanel })),
);
const HouseholdPanel = React.lazy(() =>
  import('../features/household/HouseholdPanel').then((m) => ({ default: m.HouseholdPanel })),
);
const PlanPanel = React.lazy(() =>
  import('../features/plan/PlanPanel').then((m) => ({ default: m.PlanPanel })),
);
const AskPanel = React.lazy(() =>
  import('../features/ask/AskPanel').then((m) => ({ default: m.AskPanel })),
);
const CommunityPanel = React.lazy(() =>
  import('../features/community/CommunityPanel').then((m) => ({ default: m.CommunityPanel })),
);

function renderActivePanel(
  tab: NavTabId,
  onNavigate: (tabId: NavTabId) => void,
): React.JSX.Element {
  switch (tab) {
    case 'location':
      return <LocationPanel />;
    case 'household':
      return <HouseholdPanel />;
    case 'plan':
      return <PlanPanel onNavigateTab={onNavigate} />;
    case 'ask':
      return <AskPanel />;
    case 'community':
      return <CommunityPanel />;
  }
}

/** Primary accessible application shell assembling landmarks, navigation, and lazy-loaded features. */
export function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<NavTabId>('location');

  useEffect(() => {
    const loaded = loadPersistedState();
    if (loaded.ok) {
      useAppStore.setState({
        profile: loaded.value.profile,
        language: loaded.value.language,
        selectedCity: loaded.value.selectedCity,
      });
    }

    const unsub = useAppStore.subscribe((state) => {
      savePersistedState({
        profile: state.profile,
        language: state.language,
        selectedCity: state.selectedCity,
      });
    });
    return unsub;
  }, []);

  const handleSelectTab = useCallback((tabId: NavTabId) => {
    setActiveTab(tabId);
    const tabItem = NAV_TABS.find((t) => t.id === tabId);
    if (tabItem && typeof document !== 'undefined') {
      setTimeout(() => {
        const heading = document.getElementById(tabItem.panelHeadingId);
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }, 50);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-main font-sans">
      <SkipLink targetId="main-content" />
      <AppHeader />
      <AppNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 focus:outline-none"
      >
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="w-full"
        >
          <Suspense
            fallback={
              <div className="py-16 flex justify-center items-center">
                <Spinner label="Loading air quality workspace..." />
              </div>
            }
          >
            {renderActivePanel(activeTab, handleSelectTab)}
          </Suspense>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
