import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggle: () => void;
}

const getSystemDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyDark = (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark);
};

const resolveIsDark = (theme: Theme): boolean => {
    if (theme === 'system') return getSystemDark();
    return theme === 'dark';
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'system',
            isDark: getSystemDark(),

            setTheme: (theme: Theme) => {
                const isDark = resolveIsDark(theme);
                applyDark(isDark);
                set({ theme, isDark });
            },

            toggle: () => {
                const next: Theme = get().isDark ? 'light' : 'dark';
                const isDark = next === 'dark';
                applyDark(isDark);
                set({ theme: next, isDark });
            },
        }),
        {
            name: 'forafix-theme',
            partialize: (s) => ({ theme: s.theme }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                // On rehydration, re-apply the stored theme
                const isDark = resolveIsDark(state.theme);
                applyDark(isDark);
                state.isDark = isDark;
            },
        }
    )
);

/** Call once in App to sync OS-level changes automatically */
export const initThemeListener = () => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
        const { theme, setTheme } = useThemeStore.getState();
        if (theme === 'system') setTheme('system'); // re-resolves against current OS
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
};
