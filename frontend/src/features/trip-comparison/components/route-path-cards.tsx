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
import {
    BestRouteBadge,
    RoutePathCardDetails,
    RoutePathCardHeader,
} from '@/features/trip-comparison/components/route-path-card';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import { useIsPhone } from '@/hooks/use-is-phone';

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

interface RoutePathButtonCardProps {
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
    onClick: () => void;
}

// Beside the map, which shows the route's details in its label
const RoutePathButtonCard = ({
    steps,
    badge,
    selected,
    onClick,
}: RoutePathButtonCardProps) => (
    <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium ring-1 ring-foreground/10 ring-inset outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-card aria-pressed:ring-primary/50"
    >
        <RoutePathCardHeader steps={steps} badge={badge} selected={selected} />
    </button>
);

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
    const getBadge = (index: number) =>
        index === 0 && routes.length > 1 ? (
            <BestRouteBadge order={order} />
        ) : null;
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
                <div className="flex flex-col gap-2">
                    {routes.map(({ id, steps }, index) => (
                        <RoutePathButtonCard
                            key={id}
                            steps={steps}
                            badge={getBadge(index)}
                            selected={selectedId === id}
                            onClick={() => {
                                onSelect(selectedId === id ? null : id);
                            }}
                        />
                    ))}
                </div>
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
