import type { Api, Utils } from 'common';
import { useMemo, useState } from 'react';

import type { CalloutPosition } from '@/components/map/map-callout';
import { createRoutePathGeometry } from '@/features/trip-comparison/utils/route-step';
import { findNearestPointOnLine, getPointAlong } from '@/utils/geo';

export interface RoutePathCalloutPositions {
    /** By route id. */
    positions: ReadonlyMap<string, CalloutPosition>;
    /** While a callout is dragged. */
    move: (routeId: string, position: Utils.LngLat) => void;
    /** When a callout is dropped. */
    drop: (routeId: string, position: Utils.LngLat) => void;
}

/**
 * Positions each route path's callout, or keeps it where it was dragged.
 */
export const useRoutePathCalloutPositions = (
    paths: readonly { route: Api.Route; bend: number }[],
): RoutePathCalloutPositions => {
    // memo: "Heavy" computation
    const pathGeometryByRouteId = useMemo(
        () =>
            new Map(
                paths.map(({ route, bend }) => [
                    route.id,
                    createRoutePathGeometry(route.steps, bend),
                ]),
            ),
        [paths],
    );

    const [movedPositions, setMovedPositions] = useState<
        ReadonlyMap<string, Partial<CalloutPosition>>
    >(() => new Map());

    const positions = useMemo(
        () =>
            new Map<string, CalloutPosition>(
                [...pathGeometryByRouteId].map(([routeId, pathGeometry]) => {
                    const middle = getPointAlong(pathGeometry, 0.5);
                    const moved = movedPositions.get(routeId);
                    return [
                        routeId,
                        {
                            label: moved?.label ?? middle,
                            anchor: moved?.anchor ?? middle,
                        },
                    ];
                }),
            ),
        [pathGeometryByRouteId, movedPositions],
    );

    const move = (routeId: string, position: Utils.LngLat) => {
        setMovedPositions((previous) =>
            new Map(previous).set(routeId, {
                ...previous.get(routeId),
                label: position,
            }),
        );
    };
    const drop = (routeId: string, position: Utils.LngLat) => {
        const pathGeometry = pathGeometryByRouteId.get(routeId);
        if (!pathGeometry) {
            return;
        }
        const anchor = findNearestPointOnLine(pathGeometry, position);
        setMovedPositions((previous) =>
            new Map(previous).set(routeId, {
                ...previous.get(routeId),
                anchor,
            }),
        );
    };

    return { positions, move, drop };
};
