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
import { RoutePathDetails } from '@/features/trip-comparison/components/route-path-details';
import {
    BestRouteBadge,
    RoutePathSummary,
} from '@/features/trip-comparison/components/route-path-summary';
import type { RouteOrder } from '@/features/trip-comparison/types/route';

interface RoutePathCardProps {
    routeId: string;
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
}

// An accordion item, styled as a card
const RoutePathCard = ({
    routeId,
    steps,
    badge,
    selected,
}: RoutePathCardProps) => (
    <AccordionItem
        value={routeId}
        className="
            rounded-lg ring-1 ring-foreground/10 ring-inset
            not-last:border-b-0
            hover:bg-card
            data-open:bg-card data-open:ring-primary/50
        "
    >
        <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
            <RoutePathSummary steps={steps} badge={badge} selected={selected} />
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
            <RoutePathDetails steps={steps} />
        </AccordionContent>
    </AccordionItem>
);

const RoutePathCardSkeleton = () => (
    <div
        className="
            flex h-18.5 items-center gap-3 rounded-lg px-4 ring-1
            ring-foreground/10 ring-inset
        "
    >
        <Skeleton
            className="
                size-4.5 rounded-full
                motion-reduce:animate-none
            "
        />
        <div className="flex flex-col gap-2.5">
            <Skeleton
                className="
                    h-3 w-16
                    motion-reduce:animate-none
                "
            />
            <Skeleton
                className="
                    h-4 w-14
                    motion-reduce:animate-none
                "
            />
        </div>
    </div>
);

interface RoutePathAccordionProps {
    routes: Api.Route[];
    isLoading: boolean;
    order: RouteOrder;
    selectedRouteId: string | null;
    onSelect: (routeId: string | null) => void;
}

const RoutePathAccordion = ({
    routes,
    isLoading,
    order,
    selectedRouteId,
    onSelect,
}: RoutePathAccordionProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-2">
            <Accordion
                className="gap-2"
                value={selectedRouteId ? [selectedRouteId] : []}
                onValueChange={(value: string[]) => {
                    onSelect(value.at(0) ?? null);
                }}
            >
                {routes.map(({ id, steps }, index) => (
                    <RoutePathCard
                        key={id}
                        routeId={id}
                        steps={steps}
                        selected={selectedRouteId === id}
                        badge={
                            index === 0 &&
                            routes.length > 1 && (
                                <BestRouteBadge order={order} />
                            )
                        }
                    />
                ))}
            </Accordion>
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

export default RoutePathAccordion;
