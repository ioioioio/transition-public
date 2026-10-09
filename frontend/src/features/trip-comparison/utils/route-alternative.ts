import type { Api } from 'common';

import type { RouteAlternative } from '@/features/trip-comparison/types/route-alternative';
import { isMode, type Mode } from '@/utils/mode';

const unimodalRoutingModes = [
    'driving',
    'walking',
] as const satisfies readonly Mode[];

type UnimodalRoutingMode = (typeof unimodalRoutingModes)[number];

const isUnimodalRoutingMode = (value: string): value is UnimodalRoutingMode =>
    (unimodalRoutingModes as readonly string[]).includes(value);

// The result of a mode other than transit
type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    Api.RouteResponse['result']['walking']
>;

const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [UnimodalRoutingMode, UnimodalRouteResult] =>
    isUnimodalRoutingMode(entry[0]) && entry[1] !== undefined;

type TransitRouteResult = NonNullable<Api.RouteResponse['result']['transit']>;

const isTransitRouteResultEntry = (
    entry: [string, unknown],
): entry is ['transit', TransitRouteResult] =>
    entry[0] === 'transit' && entry[1] !== undefined;

// Longest first, without walking. Unknown modes become `other`.
const sortTransitModesByDistance = (
    path: TransitRouteResult['paths'][number],
): Mode[] => {
    const distances = new Map<Mode, number>();
    for (const step of path.steps) {
        if (step.action === 'unboarding') {
            const mode = isMode(step.mode) ? step.mode : 'other';
            distances.set(
                mode,
                (distances.get(mode) ?? 0) + step.inVehicleDistance,
            );
        }
    }
    return [...distances].sort(([, a], [, b]) => b - a).map(([mode]) => mode);
};

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
            steps: [
                {
                    geometry: path.geometry,
                    mode: routingMode,
                    travelTimeSeconds: path.travelTimeSeconds,
                },
            ],
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
