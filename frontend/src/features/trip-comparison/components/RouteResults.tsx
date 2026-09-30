import { CarIcon, PathIcon, PersonSimpleWalkIcon } from '@phosphor-icons/react';
import type { Utils } from 'common';
import type { ReactNode } from 'react';

import { useRouteQuery } from '@/api/route';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type { RouteMode } from '@/features/trip-comparison/types';
import { formatDistance, formatDuration } from '@/utils/format';

type RouteResultItemProps = {
    value: string;
    icon: ReactNode;
    label: string;
    travelTimeSeconds: number;
    distanceMeters: number;
};

const RouteResultItem = ({
    value,
    icon,
    label,
    travelTimeSeconds,
    distanceMeters,
}: RouteResultItemProps) => {
    return (
        <AccordionItem
            value={value}
            className="rounded-lg ring-1 ring-foreground/10 ring-inset not-last:border-b-0 hover:bg-card data-open:bg-card data-open:ring-primary/50"
        >
            <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
                <span className="text-lg text-muted-foreground group-aria-expanded/accordion-trigger:text-primary">
                    {icon}
                </span>
                <span className="flex flex-col gap-1">
                    <span>{label}</span>
                    <span className="text-[17px] tracking-tight tabular-nums">
                        {formatDuration(travelTimeSeconds, 'fr-CA')}
                    </span>
                </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
                <div className="flex items-center gap-1.5 border-t border-border pt-2 text-xs">
                    <PathIcon className="text-muted-foreground" />
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium tabular-nums">
                        {formatDistance(distanceMeters, 'fr-CA')}
                    </span>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

type ModeRouteResultItemProps = Omit<
    RouteResultItemProps,
    'value' | 'icon' | 'label'
>;

const DrivingRouteResultItem = ({
    travelTimeSeconds,
    distanceMeters,
}: ModeRouteResultItemProps) => {
    return (
        <RouteResultItem
            value="driving"
            icon={<CarIcon />}
            label="Auto"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

const WalkingRouteResultItem = ({
    travelTimeSeconds,
    distanceMeters,
}: ModeRouteResultItemProps) => {
    return (
        <RouteResultItem
            value="walking"
            icon={<PersonSimpleWalkIcon />}
            label="Marche"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

type RouteResultsProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    selectedMode: RouteMode | null;
    onSelect: (mode: RouteMode | null) => void;
};

const RouteResults = ({
    origin,
    destination,
    selectedMode,
    onSelect,
}: RouteResultsProps) => {
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];

    return (
        <Accordion
            className="gap-2"
            value={selectedMode ? [selectedMode] : []}
            onValueChange={(value: RouteMode[]) =>
                onSelect(value.at(0) ?? null)
            }
        >
            {drivingPath && (
                <DrivingRouteResultItem
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                    distanceMeters={drivingPath.distanceMeters}
                />
            )}
            {walkingPath && (
                <WalkingRouteResultItem
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                    distanceMeters={walkingPath.distanceMeters}
                />
            )}
        </Accordion>
    );
};

export default RouteResults;
