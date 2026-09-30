import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark'),
    );

    const toggle = () => {
        document.documentElement.classList.toggle('dark', !isDark);
        setIsDark(!isDark);
    };

    return (
        <Button
            variant="ghost"
            size="icon-lg"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
            className="text-muted-foreground"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
    );
};

export default ThemeToggle;
