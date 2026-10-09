import { useTranslation } from 'react-i18next';

import type { Mode } from '@/utils/mode';

export const useModeLabels = (): Record<Mode, string> => {
    const { t } = useTranslation();
    return {
        driving: t('routeMode.driving'),
        walking: t('routeMode.walking'),
        bus: t('routeMode.bus'),
        other: t('routeMode.other'),
    };
};
