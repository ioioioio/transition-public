import { RulerIcon } from '@phosphor-icons/react';
import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { formatDistance } from '@/utils/format';

interface RoutePathSummaryFooterProps {
    steps: Api.RouteStep[];
}

export const RoutePathSummaryFooter = (props: RoutePathSummaryFooterProps) => {
    const { steps } = props;
    const { t, i18n } = useTranslation();
    const { distanceMeters } = createRouteSummary(steps);
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <RulerIcon aria-hidden className="text-muted-foreground" />
            <span className="text-muted-foreground">
                {t('tripComparison.distance')}
            </span>
            <span className="font-medium tabular-nums">
                {formatDistance(distanceMeters, i18n.language)}
            </span>
        </div>
    );
};
