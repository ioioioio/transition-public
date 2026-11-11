import type { Api, Utils } from 'common';
import { useMemo, useState } from 'react';

import { createRoutePathGeometry } from '@/features/trip-comparison/utils/route-step';
import { findNearestPointOnLine, getPointAlong } from '@/utils/geo';

export const useRoutePathCalloutPositions = (
    drawnRoutes: readonly { route: Api.Route; bend: number }[],
) => {
    // memo: "Heavy" computation
    // Each path's line, and its label's default position halfway along it
    const labeledPaths = useMemo(
        () =>
            new Map(
                drawnRoutes.map(({ route, bend }) => {
                    const line = createRoutePathGeometry(route.steps, bend);
                    return [
                        route.id,
                        { line, defaultPosition: getPointAlong(line, 0.5) },
                    ];
                }),
            ),
        [drawnRoutes],
    );

    const [labelPositions, setLabelPositions] = useState<
        ReadonlyMap<string, Utils.LngLat>
    >(() => new Map());

    const moveLabel = (routeId: string, position: Utils.LngLat) => {
        setLabelPositions((previous) =>
            new Map(previous).set(routeId, position),
        );
    };
    // The closest point of each path to its label
    const [labelAnchors, setLabelAnchors] = useState<
        ReadonlyMap<string, Utils.LngLat>
    >(() => new Map());
    const moveLabelAnchor = (routeId: string, position: Utils.LngLat) => {
        const path = labeledPaths.get(routeId);
        if (!path) {
            return;
        }
        setLabelAnchors((previous) =>
            new Map(previous).set(
                routeId,
                findNearestPointOnLine(path.line, position),
            ),
        );
    };

    return {
        labeledPaths,
        labelPositions,
        labelAnchors,
        moveLabel,
        moveLabelAnchor,
    };
};
