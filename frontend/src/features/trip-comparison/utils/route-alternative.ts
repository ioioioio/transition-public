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
): RouteAlternative | null => {
    if (isUnimodalRouteResultEntry(entry)) {
        const [routingMode, result] = entry;
        const path = result.paths.at(0);
        if (!path) {
            return null;
        }
        return {
            id: routingMode,
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
        if (!path) {
            return null;
        }
        return {
            id: routingMode,
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

export const createRouteAlternatives = (
    result: Api.RouteResponse['result'],
): RouteAlternative[] =>
    Object.entries(result).flatMap(
        (entry) => createRouteAlternative(entry) ?? [],
    );
