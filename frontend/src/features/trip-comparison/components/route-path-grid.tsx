import { TrophyIcon } from '@phosphor-icons/react';
import type { Api } from 'common';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface BestRouteIconBadgeProps {
    order: RouteOrder;
}

const BestRouteIconBadge = (props: BestRouteIconBadgeProps) => {
    const { order } = props;
    const { t } = useTranslation();
    const labels: Record<RouteOrder, string> = {
        travelTime: t('bestRoute.travelTime'),
    };
    return (
        <Badge
            title={labels[order]}
            className="
                h-auto rounded-sm bg-highlight p-0.5 text-highlight-foreground
                [&>svg]:size-2.5!
            "
        >
            <TrophyIcon weight="fill" aria-hidden />
            <span className="sr-only">{labels[order]}</span>
        </Badge>
    );
};

interface RoutePathOptionProps {
    routeId: string;
    steps: Api.RouteStep[];
    badge?: ReactNode;
}

const RoutePathOption = (props: RoutePathOptionProps) => {
    const { routeId, steps, badge } = props;
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';

    const screenReaderTitle = rankedModes
        .map((rankedMode) => modeLabels[rankedMode])
        .join(' + ');

    return (
        <ToggleGroupItem
            value={routeId}
            className="
                relative h-auto flex-col gap-1 rounded-md px-1 py-2
                text-muted-foreground
                hover:border-primary/60 hover:bg-transparent
                aria-pressed:border-primary aria-pressed:bg-primary/10
                aria-pressed:text-primary
                aria-pressed:hover:text-primary
                [&_svg:not([class*='size-'])]:size-auto
            "
        >
            {badge && (
                <span className="absolute top-0.5 right-0.5 flex">{badge}</span>
            )}
            <span aria-hidden className="flex items-center gap-1 text-lg">
                {rankedModes.map((rankedMode) => {
                    const ModeIcon = modeIcons[rankedMode];
                    return <ModeIcon key={rankedMode} />;
                })}
            </span>
            <span className="sr-only">{screenReaderTitle}</span>
            <span aria-hidden className="text-xs">
                {modeLabels[mainMode]}
            </span>
            <span className="text-sm font-normal text-foreground tabular-nums">
                {formatDuration(travelTimeSeconds, i18n.language)}
            </span>
        </ToggleGroupItem>
    );
};

const modeWidths = ['w-8', 'w-10', 'w-12', 'w-14', 'w-16', 'w-18'] as const;
const timeWidths = ['w-17', 'w-18'] as const;

const pickRandom = <T,>(items: readonly T[]) =>
    items.at(Math.floor(Math.random() * items.length));

// Shaped at random, so placeholders side by side look like route paths
const createSkeletonShape = () => ({
    iconCount: 1 + Math.floor(Math.random() * 4),
    modeWidth: pickRandom(modeWidths),
    timeWidth: pickRandom(timeWidths),
});

const RoutePathOptionSkeleton = () => {
    const [shape] = useState(createSkeletonShape);
    return (
        <div
            aria-hidden
            className="
                flex flex-col items-center gap-1 rounded-md border border-input
                px-1 py-2
            "
        >
            <div className="flex gap-1">
                {Array.from({ length: shape.iconCount }, (_, index) => (
                    <Skeleton
                        key={index}
                        className="
                            size-4.5 rounded-full
                            motion-reduce:animate-none
                        "
                    />
                ))}
            </div>
            <Skeleton
                className={cn(
                    `
                        my-0.5 h-3
                        motion-reduce:animate-none
                    `,
                    shape.modeWidth,
                )}
            />
            <Skeleton
                className={cn(
                    `
                        my-0.75 h-3.5
                        motion-reduce:animate-none
                    `,
                    shape.timeWidth,
                )}
            />
        </div>
    );
};

interface RoutePathGridProps {
    routes: Api.Route[];
    pendingRequestCount: number;
    order: RouteOrder;
    selectedRouteId: string | null;
    onSelect: (routeId: string | null) => void;
}

const RoutePathGrid = (props: RoutePathGridProps) => {
    const { routes, pendingRequestCount, order, selectedRouteId, onSelect } =
        props;
    const { t } = useTranslation();
    return (
        <ToggleGroup
            aria-label={t('tripComparison.routes')}
            variant="outline"
            spacing={1}
            className="grid w-full grid-cols-3"
            value={selectedRouteId ? [selectedRouteId] : []}
            // Pressing the selected route path again unselects it
            onValueChange={(value: string[]) => {
                onSelect(value.at(0) ?? null);
            }}
        >
            {routes.map((route, index) => (
                <RoutePathOption
                    key={route.id}
                    routeId={route.id}
                    steps={route.steps}
                    badge={
                        index === 0 &&
                        routes.length > 1 && (
                            <BestRouteIconBadge order={order} />
                        )
                    }
                />
            ))}
            {pendingRequestCount > 0 && (
                <>
                    <span role="status" className="sr-only">
                        {t('tripComparison.loadingRoutes')}
                    </span>
                    {Array.from({ length: pendingRequestCount }, (_, index) => (
                        <RoutePathOptionSkeleton key={index} />
                    ))}
                </>
            )}
        </ToggleGroup>
    );
};

export default RoutePathGrid;
