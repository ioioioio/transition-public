import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

// Labels are in the target language so people can find their own
const targets = {
    'en-CA': { lng: 'fr-CA', label: 'Français', code: 'FR' },
    'fr-CA': { lng: 'en-CA', label: 'English', code: 'EN' },
} as const;

const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const target =
        i18n.resolvedLanguage === 'fr-CA' ? targets['fr-CA'] : targets['en-CA'];

    return (
        <Button
            variant="ghost"
            size="icon-lg"
            lang={target.lng}
            aria-label={target.label}
            onClick={() => i18n.changeLanguage(target.lng)}
            className="text-muted-foreground"
        >
            {target.code}
        </Button>
    );
};

export default LanguageToggle;
