import type { Api } from 'common';
import type { Position } from 'geojson';
import { useMemo, useState } from 'react';

import { RoutePathLayer } from '@/components/map/route-path-layer';
import type { RouteStepLayerStyles } from '@/components/map/route-step-layer';
import RoutePathLabel from '@/features/trip-comparison/components/route-path-label';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import { useLayerStack } from '@/hooks/use-layer-stack';
import { findNearestPointOnLine, getPointAlong } from '@/utils/geo';
import { createNestedId } from '@/utils/nested-id';
import { createRoutePathGeometry, getRouteStepIcon } from '@/utils/route-step';

// The id a route's map sources and layers are nested under
const createRoutePathId = (routeId: string) => createNestedId('route', routeId);

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
            })),
        [routes],
    );

    // memo: "Heavy" computation
    // Each path's line, and its label's default position halfway along it
    const labeledPaths = useMemo(
        () =>
            new Map(
                drawnRoutes.map(({ route, styles }) => {
                    const line = createRoutePathGeometry(
                        route.steps,
                        styles.bend,
                    );
                    return [
                        route.id,
                        { line, defaultPosition: getPointAlong(line, 0.5) },
                    ];
                }),
            ),
        [drawnRoutes],
    );

    const [labelPositions, setLabelPositions] = useState<
        ReadonlyMap<string, Position>
    >(() => new Map());

    const moveLabel = (id: string, position: Position) => {
        setLabelPositions((previous) => new Map(previous).set(id, position));
    };
    // The closest point of each path to its label
    const [labelAnchors, setLabelAnchors] = useState<
        ReadonlyMap<string, Position>
    >(() => new Map());
    const moveLabelAnchor = (id: string, position: Position) => {
        const path = labeledPaths.get(id);
        if (!path) {
            return;
        }
        setLabelAnchors((previous) =>
            new Map(previous).set(
                id,
                findNearestPointOnLine(path.line, position),
            ),
        );
    };

    // When a route is selected, the others' label is hidden
    const isShown = (id: string) => selectedId === null || selectedId === id;

    const routeStack = useLayerStack();

    return (
        <>
            {drawnRoutes.map(({ route, pathId, styles }) => (
                <RoutePathLayer
                    key={route.id}
                    id={pathId}
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
                        <RoutePathLabel
                            key={route.id}
                            position={
                                labelPositions.get(route.id) ??
                                path.defaultPosition
                            }
                            steps={route.steps}
                            selected={selectedId === route.id}
                            stackOrder={routeStack.ids.indexOf(pathId) + 1}
                            onClick={() => {
                                toggle(route.id);
                            }}
                            onPress={() => {
                                routeStack.raise(pathId);
                            }}
                            anchor={
                                labelAnchors.get(route.id) ??
                                path.defaultPosition
                            }
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

export default RoutePathLayers;
