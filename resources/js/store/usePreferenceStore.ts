import { create } from 'zustand';

interface PreferenceState {
    isCookieSettingsOpen: boolean;
    openCookieSettings: () => void;
    closeCookieSettings: () => void;
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
    isCookieSettingsOpen: false,
    openCookieSettings: () => set({ isCookieSettingsOpen: true }),
    closeCookieSettings: () => set({ isCookieSettingsOpen: false }),
}));
