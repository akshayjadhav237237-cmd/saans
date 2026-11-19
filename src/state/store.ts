import { create } from 'zustand';
import { PRESET_CITIES } from '../data/cities';
import type { HouseholdProfile } from '../domain/types';
import type { AppStoreState } from './types';

export type AppState = AppStoreState;

const defaultCity = PRESET_CITIES[0] ?? null;

const defaultProfile: HouseholdProfile = {
  id: 'h_default',
  name: 'Our Family',
  city: 'Delhi',
  members: [
    { id: 'm_adult_1', role: 'adult', hasRespiratoryCondition: false },
    { id: 'm_child_1', role: 'child', hasRespiratoryCondition: false },
  ],
};

/** Global reactive Zustand store managing application slices and in-memory session states. */
export const useAppStore = create<AppStoreState>((set) => ({
  language: 'en',
  setLanguage: (language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    set({ language });
  },

  selectedCity: defaultCity,
  setSelectedCity: (selectedCity) => set({ selectedCity }),

  airData: null,
  isAirLoading: false,
  airError: null,
  setAirData: (airData) => set({ airData, airError: null, isAirLoading: false }),
  setAirLoading: (isAirLoading) => set({ isAirLoading }),
  setAirError: (airError) => set({ airError, isAirLoading: false }),

  profile: defaultProfile,
  setProfile: (profile) => set({ profile }),

  plan: null,
  setPlan: (plan) => set({ plan }),

  aiKey: '',
  setAiKey: (aiKey) => set({ aiKey: aiKey.trim() }),
  clearAiKey: () => set({ aiKey: '' }),
}));
