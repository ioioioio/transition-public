import type { Api } from 'common';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    BestRouteBadge,
    BestRouteIconBadge,
    RoutePathCardDetails,
    RoutePathCardHeader,
} from '@/features/trip-comparison/components/route-path-card';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useIsPhone } from '@/hooks/use-is-phone';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface RoutePathCardProps {
    id: string;
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
}

// On a phone, an accordion item styled as a card, as the map has no room for
// the route's details
const RoutePathAccordionCard = ({
    id,
    steps,
    badge,
    selected,
}: RoutePathCardProps) => (
    <AccordionItem
        value={id}
        className="rounded-lg ring-1 ring-foreground/10 ring-inset not-last:border-b-0 hover:bg-card data-open:bg-card data-open:ring-primary/50"
    >
        <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
            <RoutePathCardHeader
                steps={steps}
                badge={badge}
                selected={selected}
            />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
            <RoutePathCardDetails steps={steps} />
        </AccordionContent>
    </AccordionItem>
);

interface RoutePathOptionProps {
    id: string;
    steps: Api.RouteStep[];
    // In its corner
    badge?: ReactNode;
}

// Beside the map, which shows the route's details in its label. Its modes'
// icons tell it apart from routes with the same main mode.
const RoutePathOption = ({ id, steps, badge }: RoutePathOptionProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';
    // E.g. "Plane + Bus", as the icons alone don't say it
    const title = rankedModes
        .map((rankedMode) => modeLabels[rankedMode])
        .join(' + ');

    return (
        <ToggleGroupItem
            value={id}
            className="relative h-auto flex-col gap-1 rounded-md px-1 py-2 text-muted-foreground hover:border-primary/60 hover:bg-transparent aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:hover:text-primary [&_svg:not([class*='size-'])]:size-auto"
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
            <span className="sr-only">{title}</span>
            <span aria-hidden className="text-xs">
                {modeLabels[mainMode]}
            </span>
            <span className="text-sm font-normal text-foreground tabular-nums">
                {formatDuration(travelTimeSeconds, i18n.language)}
            </span>
        </ToggleGroupItem>
    );
};

const RoutePathCardSkeleton = () => (
    <div className="flex h-18.5 items-center gap-3 rounded-lg px-4 ring-1 ring-foreground/10 ring-inset">
        <Skeleton className="size-4.5 rounded-full motion-reduce:animate-none" />
        <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-16 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-14 motion-reduce:animate-none" />
        </div>
    </div>
);

interface RoutePathCardsProps {
    routes: Api.Route[];
    isLoading: boolean;
    order: RouteOrder;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

const RoutePathCards = ({
    routes,
    isLoading,
    order,
    selectedId,
    onSelect,
}: RoutePathCardsProps) => {
    const { t } = useTranslation();
    const isPhone = useIsPhone();
    // Only stands out when there's more than one
    const isBest = (index: number) => index === 0 && routes.length > 1;
    const getBadge = (index: number) =>
        isBest(index) ? <BestRouteBadge order={order} /> : null;
    return (
        <div className="flex flex-col gap-2">
            {isPhone ? (
                <Accordion
                    className="gap-2"
                    value={selectedId ? [selectedId] : []}
                    onValueChange={(value: string[]) => {
                        onSelect(value.at(0) ?? null);
                    }}
                >
                    {routes.map(({ id, steps }, index) => (
                        <RoutePathAccordionCard
                            key={id}
                            id={id}
                            steps={steps}
                            badge={getBadge(index)}
                            selected={selectedId === id}
                        />
                    ))}
                </Accordion>
            ) : (
                <ToggleGroup
                    aria-label={t('tripComparison.routes')}
                    variant="outline"
                    spacing={1}
                    className="grid w-full grid-cols-3"
                    value={selectedId ? [selectedId] : []}
                    // Pressing the selected route again unselects it
                    onValueChange={(value: string[]) => {
                        onSelect(value.at(0) ?? null);
                    }}
                >
                    {routes.map(({ id, steps }, index) => (
                        <RoutePathOption
                            key={id}
                            id={id}
                            steps={steps}
                            badge={
                                isBest(index) && (
                                    <BestRouteIconBadge order={order} />
                                )
                            }
                        />
                    ))}
                </ToggleGroup>
            )}
            {isLoading && (
                <div role="status" className="flex flex-col gap-2">
                    <span className="sr-only">
                        {t('tripComparison.loadingRoutes')}
                    </span>
                    {/* Fewer once some routes are shown */}
                    {Array.from(
                        { length: routes.length > 0 ? 1 : 3 },
                        (_, index) => (
                            <RoutePathCardSkeleton key={index} />
                        ),
                    )}
                </div>
            )}
        </div>
    );
};

export default RoutePathCards;
