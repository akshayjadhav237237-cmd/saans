import type { TranslationKey } from '../i18n';

export type NavTabId = 'location' | 'household' | 'plan' | 'ask' | 'community';

export interface NavTabItem {
  readonly id: NavTabId;
  readonly labelKey: TranslationKey;
  readonly panelHeadingId: string;
}

export const NAV_TABS: readonly NavTabItem[] = [
  { id: 'location', labelKey: 'app.nav.location', panelHeadingId: 'location-heading' },
  { id: 'household', labelKey: 'app.nav.household', panelHeadingId: 'household-profile-heading' },
  { id: 'plan', labelKey: 'app.nav.plan', panelHeadingId: 'exposure-plan-heading' },
  { id: 'ask', labelKey: 'app.nav.ask', panelHeadingId: 'ask-saans-heading' },
  { id: 'community', labelKey: 'app.nav.community', panelHeadingId: 'community-advisory-heading' },
];
