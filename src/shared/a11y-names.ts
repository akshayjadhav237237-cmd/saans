export const A11Y_NAMES = {
  skipLink: 'Skip to main content',
  header: 'Application Header',
  mainNav: 'Main Navigation',
  mainContent: 'Main Content',
  footer: 'Application Footer',
  tabs: {
    location: 'Location & Air',
    household: 'Household Profile',
    plan: 'Exposure Budget & Plan',
    ask: 'Ask Saans AI',
    community: 'Community Advisory',
  },
  buttons: {
    switchLanguage: 'Toggle language between English and Hindi',
    searchCity: 'Search Indian city or town',
    applyManualPm25: 'Set Manual Value',
    toggleManualPm25: 'Enter PM2.5 manually (offline mode)',
    addMember: 'Add Family Member',
    removeMember: 'Remove',
    saveHousehold: 'Save Household Profile',
    askQuestion: 'Ask Question',
    clearApiKey: 'Clear Key',
    downloadIcs: 'Download Calendar (.ics)',
    copyPlan: 'Copy Plan Text',
    printAdvisory: 'Print Advisory',
    clearData: 'Clear My Stored Data',
  },
  inputs: {
    searchCity: 'Search Indian city or town',
    manualPm25: 'Manual PM2.5 (ug/m3)',
    householdName: 'Household Label',
    question: 'Your Question',
    geminiApiKey: 'Optional Gemini API Key (stored in browser memory only)',
  },
  charts: {
    pm25ChartTitle: '24-Hour PM2.5 Air Quality Forecast',
    pm25ChartDesc: 'Hourly particulate matter trend graph and data table',
    toggleDataTable: 'Show data table alternative',
  },
} as const;

export type A11yNameKey = keyof typeof A11Y_NAMES;
