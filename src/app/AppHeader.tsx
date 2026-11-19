import React from 'react';
import { APP_CONFIG } from '../config/constants';
import { translate } from '../i18n';
import { A11Y_NAMES, Button } from '../shared';
import { useAppStore } from '../state/store';

/**
 * Accessible application header landmark displaying branding, subtitle, and bilingual switcher.
 */
export function AppHeader(): React.JSX.Element {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="border-b border-border bg-bg-surface px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span aria-hidden="true" className="text-3xl text-teal">
            🍃
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
                {translate(language, 'app.title')}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-bg-elevated text-text-muted font-medium border border-border">
                v{APP_CONFIG.appVersion}
              </span>
            </div>
            <p className="text-xs text-text-muted">{translate(language, 'app.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleLanguageToggle}
            aria-label={A11Y_NAMES.buttons.switchLanguage}
            className="text-xs font-semibold px-3 py-2 min-h-[44px] min-w-[44px]"
          >
            🌐 {translate(language, 'app.lang.switch')}
          </Button>
        </div>
      </div>
    </header>
  );
}
