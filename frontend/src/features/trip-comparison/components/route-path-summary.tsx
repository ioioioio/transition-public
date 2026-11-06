import type { Api } from 'common';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface BestRouteBadgeProps {
    order: RouteOrder;
}

export const BestRouteBadge = ({ order }: BestRouteBadgeProps) => {
    const { t } = useTranslation();
    const labels: Record<RouteOrder, string> = {
        travelTime: t('bestRoute.travelTime'),
    };
    return (
        <Badge className="h-auto rounded-sm bg-highlight font-normal px-2.5 py-0.75 text-[11px] tracking-[0.02em] text-highlight-foreground">
            {labels[order]}
        </Badge>
    );
};

interface RoutePathSummaryProps {
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
}

export const RoutePathSummary = ({
    steps,
    badge,
    selected,
}: RoutePathSummaryProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const MainModeIcon = modeIcons[rankedModes.at(0) ?? 'other'];
    // E.g. "Plane + Bus"
    const title = rankedModes
        .map((rankedMode) => modeLabels[rankedMode])
        .join(' + ');

    return (
        <>
            <span
                className={cn(
                    'text-lg',
                    selected ? 'text-primary' : 'text-muted-foreground',
                )}
            >
                <MainModeIcon aria-hidden />
            </span>
            <span className="flex flex-1 flex-col gap-1">
                <span className="flex items-center justify-between gap-2">
                    {title}
                    {badge}
                </span>
                <span className="text-[17px] tracking-tight tabular-nums">
                    {formatDuration(travelTimeSeconds, i18n.language)}
                </span>
            </span>
        </>
    );
};
