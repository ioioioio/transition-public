import { MoonIcon, SunIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon-lg"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="text-muted-foreground"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
};

export default ThemeToggle;
