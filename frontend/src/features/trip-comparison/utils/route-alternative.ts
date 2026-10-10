import type { Api } from 'common';
import type { Position } from 'geojson';

import type {
    RouteAlternative,
    RouteAlternativeOrder,
} from '@/features/trip-comparison/types/route-alternative';
import type { RouteStepData } from '@/types/route-step';
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

const createUnimodalStep = (
    routingMode: UnimodalRoutingMode,
    path: UnimodalRouteResult['paths'][number],
): RouteStepData => {
    switch (routingMode) {
        case 'walking':
            return {
                activity: 'walkingToDestination',
                geometry: path.geometry,
                durationSeconds: path.travelTimeSeconds,
            };
        case 'driving':
            return {
                activity: 'inVehicle',
                mode: routingMode,
                geometry: path.geometry,
                durationSeconds: path.travelTimeSeconds,
            };
        default:
            return routingMode satisfies never;
    }
};

const createTransitSteps = (
    path: TransitRouteResult['paths'][number],
    origin: Position,
    destination: Position,
): RouteStepData[] => {
    const steps: RouteStepData[] = [];
    let from = origin;
    path.steps.forEach((step, index) => {
        switch (step.action) {
            case 'walking': {
                const next = path.steps.at(index + 1);
                const toStop = next?.action === 'boarding';
                const to = toStop ? next.nodeCoordinates : destination;
                steps.push({
                    activity: toStop ? 'walkingToStop' : 'walkingToDestination',
                    geometry: { type: 'LineString', coordinates: [from, to] },
                    durationSeconds: step.travelTime,
                });
                from = to;
                break;
            }
            case 'boarding':
                steps.push({
                    activity: 'waitingAtStop',
                    geometry: {
                        type: 'Point',
                        coordinates: step.nodeCoordinates,
                    },
                    durationSeconds: step.waitingTime,
                });
                from = step.nodeCoordinates;
                break;
            case 'unboarding': {
                const to = step.nodeCoordinates;
                steps.push({
                    activity: 'inVehicle',
                    mode: isMode(step.mode) ? step.mode : 'other',
                    geometry: { type: 'LineString', coordinates: [from, to] },
                    durationSeconds: step.inVehicleTime,
                });
                from = to;
                break;
            }
            default:
                step satisfies never;
        }
    });
    return steps;
};

// Null when the routing mode isn't supported, or no path was found
const createRouteAlternative = (
    entry: [string, unknown],
    origin: Position,
    destination: Position,
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
            steps: [createUnimodalStep(routingMode, path)],
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
            steps: createTransitSteps(path, origin, destination),
        };
    }
    return null;
};

export const createRouteAlternatives = ({
    query,
    result,
}: Api.RouteResponse): RouteAlternative[] => {
    const origin = query.originGeojson.geometry.coordinates;
    const destination = query.destinationGeojson.geometry.coordinates;
    const scenarioId =
        typeof query.scenarioId === 'string' ? query.scenarioId : null;
    return Object.entries(result).flatMap(
        (entry) =>
            createRouteAlternative(entry, origin, destination, scenarioId) ??
            [],
    );
};

const compareRouteAlternatives: Record<
    RouteAlternativeOrder,
    (a: RouteAlternative, b: RouteAlternative) => number
> = {
    travelTime: (a, b) =>
        a.summary.travelTimeSeconds - b.summary.travelTimeSeconds,
};

export const createSortedRouteAlternatives = (
    response: Api.RouteResponse,
    order: RouteAlternativeOrder,
): RouteAlternative[] =>
    createRouteAlternatives(response).toSorted(compareRouteAlternatives[order]);
