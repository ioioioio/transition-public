import type { Api } from 'common';
import type { Position } from 'geojson';
import { useMemo, useState } from 'react';

import { RoutePathLayer } from '@/components/map/route-path-layer';
import type { RouteStepLayerStyles } from '@/components/map/route-step-layer';
import RoutePathLabel from '@/features/trip-comparison/components/route-path-label';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import { getPointAlong } from '@/utils/geo';
import { createRoutePathGeometry, getRouteStepIcon } from '@/utils/route-step';

/**
 * Styles a path by its rank, from the fastest (`0`) to the slowest
 */
const createRoutePathStyles = (
    rank: number,
    count: number,
): RouteStepLayerStyles => {
    // From 0 for the fastest to 1 for the slowest
    const slowness = count > 1 ? rank / (count - 1) : 0;
    const side = rank % 2 === 0 ? 1 : -1;
    return {
        line: { dashArray: [3 - 2.75 * slowness, 1 + slowness] },
        // More curved when faster, so the fastest is the longest and stands out
        bend: side * (0.2 - 0.12 * slowness),
    };
};

interface RoutePathLayersProps {
    routes: Api.Route[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

const RoutePathLayers = ({
    routes,
    selectedId,
    onSelect,
}: RoutePathLayersProps) => {
    const toggle = (id: string) => {
        onSelect(selectedId === id ? null : id);
    };

    // memo: Need to keep identity for defaultLabelPositions
    const drawnRoutes = useMemo(
        () =>
            sortRoutes(
                routes.filter(({ steps }) => steps.length > 0),
                'travelTime',
            ).map((route, rank, sortedRoutes) => ({
                route,
                styles: createRoutePathStyles(rank, sortedRoutes.length),
            })),
        [routes],
    );

    // memo: "Heavy" computation
    const defaultLabelPositions = useMemo(
        () =>
            new Map(
                drawnRoutes.map(({ route, styles }) => [
                    route.id,
                    getPointAlong(
                        createRoutePathGeometry(route.steps, styles.bend),
                        0.5,
                    ),
                ]),
            ),
        [drawnRoutes],
    );

    const [labelPositions, setLabelPositions] = useState<
        ReadonlyMap<string, Position>
    >(() => new Map());

    const moveLabel = (id: string, position: Position) => {
        setLabelPositions((previous) => new Map(previous).set(id, position));
    };

    // When a route is selected, the others' label is hidden
    const isShown = (id: string) => selectedId === null || selectedId === id;

    return (
        <>
            {drawnRoutes.map(({ route, styles }) => (
                <RoutePathLayer
                    key={route.id}
                    id={`route-${route.id}`}
                    steps={route.steps}
                    getStepIcon={getRouteStepIcon}
                    styles={styles}
                    emphasis={
                        selectedId === null
                            ? 'default'
                            : selectedId === route.id
                              ? 'selected'
                              : 'muted'
                    }
                    onClick={() => {
                        toggle(route.id);
                    }}
                />
            ))}
            {drawnRoutes
                .filter(({ route }) => isShown(route.id))
                .map(({ route }) => {
                    const position =
                        labelPositions.get(route.id) ??
                        defaultLabelPositions.get(route.id);
                    if (!position) {
                        return null;
                    }
                    return (
                        <RoutePathLabel
                            key={route.id}
                            position={position}
                            steps={route.steps}
                            selected={selectedId === route.id}
                            onClick={() => {
                                toggle(route.id);
                            }}
                            onDrag={(draggedTo) => {
                                moveLabel(route.id, draggedTo);
                            }}
                        />
                    );
                })}
        </>
    );
};

export default RoutePathLayers;
