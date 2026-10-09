import type { Api } from 'common';

import type { RouteAlternative } from '@/features/trip-comparison/types/route-alternative';
import {
    isTransitRouteResultEntry,
    isUnimodalRouteResultEntry,
    sortTransitModesByDistance,
} from '@/features/trip-comparison/utils/route-result';

// Null when the routing mode isn't supported, or no path was found
const createRouteAlternative = (
    entry: [string, unknown],
    scenarioId: string | null,
): RouteAlternative | null => {
    if (isUnimodalRouteResultEntry(entry)) {
        const [routingMode, result] = entry;
        const path = result.paths.at(0);
        if (!path) {
            return null;
        }
        return {
            id: `${routingMode}-0`,
            summary: {
                rankedModes: [routingMode],
                travelTimeSeconds: path.travelTimeSeconds,
                distanceMeters: path.distanceMeters,
            },
            steps: [{ geometry: path.geometry, mode: routingMode }],
        };
    }
    if (isTransitRouteResultEntry(entry)) {
        const [routingMode, result] = entry;
        const path = result.paths.at(0);
        if (!path || scenarioId === null) {
            return null;
        }
        return {
            id: `${routingMode}-${scenarioId}-0`,
            summary: {
                rankedModes: sortTransitModesByDistance(path),
                travelTimeSeconds: path.totalTravelTime,
                distanceMeters: path.totalDistance,
            },
            // Not drawn yet
            steps: [],
        };
    }
    return null;
};

export const createRouteAlternatives = ({
    query,
    result,
}: Api.RouteResponse): RouteAlternative[] => {
    const scenarioId =
        typeof query.scenarioId === 'string' ? query.scenarioId : null;
    return Object.entries(result).flatMap(
        (entry) => createRouteAlternative(entry, scenarioId) ?? [],
    );
};
