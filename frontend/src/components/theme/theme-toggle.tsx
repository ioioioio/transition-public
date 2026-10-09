import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

const ThemeToggle = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon-lg"
            aria-label={
                isDark ? t('theme.switchToLight') : t('theme.switchToDark')
            }
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="text-muted-foreground"
        >
            {isDark ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
        </Button>
    );
};

export default ThemeToggle;
