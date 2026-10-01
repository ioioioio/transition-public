import { useEffect, useState } from 'react';

import { ThemeProviderContext, type Theme } from '@/hooks/use-theme';

type ThemeProviderProps = {
    children: React.ReactNode;
    storageKey?: string;
};

const getSystemTheme = (): Theme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

export function ThemeProvider({
    children,
    storageKey = 'vite-ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem(storageKey);
        return storedTheme === 'dark' || storedTheme === 'light'
            ? storedTheme
            : getSystemTheme(); // Default to system theme
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}
