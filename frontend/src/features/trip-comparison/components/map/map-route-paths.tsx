import type { Api } from 'common';
import { useMemo, useState } from 'react';

import type { MapLineStyles } from '@/components/map/map-line';
import { MapRoutePath } from '@/features/trip-comparison/components/map/map-route-path';
import MapRoutePathCallout from '@/features/trip-comparison/components/map/map-route-path-callout';
import { BestRouteBadge } from '@/features/trip-comparison/components/route-path-summary/route-path-summary-header';
import { useRoutePathCalloutPositions } from '@/features/trip-comparison/hooks/use-route-path-callout-positions';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import { getRouteStepIcon } from '@/features/trip-comparison/utils/route-step';
import { useLayerStack } from '@/hooks/map/use-layer-stack';
import { useIsPhone } from '@/hooks/use-is-phone';
import { createNestedId } from '@/utils/nested-id';

// The id a route's map sources and layers are nested under
const createRoutePathId = (routeId: string) => createNestedId('route', routeId);

// From 0 for the fastest to 1 for the slowest
const findSlowness = (rank: number, count: number) =>
    count > 1 ? rank / (count - 1) : 0;

/**
 * Styles a path by its rank, from the fastest (`0`) to the slowest
 */
const createRoutePathStyles = (rank: number, count: number): MapLineStyles => {
    const slowness = findSlowness(rank, count);
    return { dashArray: [3 - 2.75 * slowness, 1 + slowness] };
};

/**
 * Bends a path by its rank, from the fastest (`0`) to the slowest, to alternating sides
 */
const findRoutePathBend = (rank: number, count: number) => {
    const side = rank % 2 === 0 ? 1 : -1;
    // More curved when faster, so the fastest is the longest and stands out
    return side * (0.2 - 0.12 * findSlowness(rank, count));
};

interface MapRoutePathsProps {
    routes: Api.Route[];
    selectedRouteId: string | null;
    onSelect: (routeId: string | null) => void;
}

const MapRoutePaths = ({
    routes,
    selectedRouteId,
    onSelect,
}: MapRoutePathsProps) => {
    const toggle = (routeId: string) => {
        onSelect(selectedRouteId === routeId ? null : routeId);
    };

    // memo: Need to keep identity for labeledPaths
    const drawnRoutes = useMemo(
        () =>
            sortRoutes(
                routes.filter(({ steps }) => steps.length > 0),
                'travelTime',
            ).map((route, rank, sortedRoutes) => ({
                route,
                pathId: createRoutePathId(route.id),
                styles: createRoutePathStyles(rank, sortedRoutes.length),
                bend: findRoutePathBend(rank, sortedRoutes.length),
            })),
        [routes],
    );

    const {
        labeledPaths,
        labelPositions,
        labelAnchors,
        moveLabel,
        moveLabelAnchor,
    } = useRoutePathCalloutPositions(drawnRoutes);

    // When a route is selected, the others' label is hidden
    const isShown = (routeId: string) =>
        selectedRouteId === null || selectedRouteId === routeId;

    const routeStack = useLayerStack();

    // Raises the newly selected route, whatever selected it
    const [lastSelectedRouteId, setLastSelectedRouteId] = useState<
        string | null
    >(null);
    if (selectedRouteId !== lastSelectedRouteId) {
        setLastSelectedRouteId(selectedRouteId);
        if (selectedRouteId !== null) {
            routeStack.raise(createRoutePathId(selectedRouteId));
        }
    }

    const bestRouteId = drawnRoutes.at(0)?.route.id;
    const isPhone = useIsPhone();

    return (
        <>
            {drawnRoutes.map(({ route, pathId, styles, bend }) => (
                <MapRoutePath
                    key={route.id}
                    id={pathId}
                    steps={route.steps}
                    getStepIcon={getRouteStepIcon}
                    styles={styles}
                    bend={bend}
                    emphasis={
                        selectedRouteId === null
                            ? 'default'
                            : selectedRouteId === route.id
                              ? 'selected'
                              : 'muted'
                    }
                    onClick={() => {
                        toggle(route.id);
                    }}
                    onPress={() => {
                        routeStack.raise(pathId);
                    }}
                />
            ))}
            {drawnRoutes
                .filter(({ route }) => isShown(route.id))
                .map(({ route, pathId }) => {
                    const path = labeledPaths.get(route.id);
                    if (!path) {
                        return null;
                    }
                    return (
                        <MapRoutePathCallout
                            key={route.id}
                            position={{
                                label:
                                    labelPositions.get(route.id) ??
                                    path.defaultPosition,
                                anchor:
                                    labelAnchors.get(route.id) ??
                                    path.defaultPosition,
                            }}
                            steps={route.steps}
                            badge={
                                route.id === bestRouteId && (
                                    <BestRouteBadge order="travelTime" />
                                )
                            }
                            selected={selectedRouteId === route.id}
                            // A card would cover too much of a phone's map
                            expanded={selectedRouteId === route.id && !isPhone}
                            expandable={!isPhone}
                            stackOrder={routeStack.ids.indexOf(pathId) + 1}
                            onClick={() => {
                                toggle(route.id);
                            }}
                            onPress={() => {
                                routeStack.raise(pathId);
                            }}
                            onDrag={(draggedTo) => {
                                moveLabel(route.id, draggedTo);
                            }}
                            onDrop={(droppedAt) => {
                                moveLabelAnchor(route.id, droppedAt);
                            }}
                        />
                    );
                })}
        </>
    );
};

export default MapRoutePaths;
