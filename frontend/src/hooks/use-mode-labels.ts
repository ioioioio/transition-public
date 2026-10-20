import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

export const useModeLabels = (): Record<Api.Mode, string> => {
    const { t } = useTranslation();
    return {
        driving: t('routeMode.driving'),
        walking: t('routeMode.walking'),
        highSpeedRail: t('routeMode.highSpeedRail'),
        bus: t('routeMode.bus'),
        metro: t('routeMode.metro'),
        plane: t('routeMode.plane'),
        rail: t('routeMode.rail'),
        other: t('routeMode.other'),
    };
};
