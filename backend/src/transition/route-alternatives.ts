import { Api, type Utils } from 'common';
import type { z } from 'zod';

import type * as TransitionSchema from './generated/transitionAPI.zod';

type TransitionRouteResponse = z.infer<
    typeof TransitionSchema.PostApiV1RouteResponse
>;

const unimodalRoutingModes = [
    'driving',
    'walking',
] as const satisfies readonly Api.Mode[];

type UnimodalRoutingMode = (typeof unimodalRoutingModes)[number];

const isUnimodalRoutingMode = (value: string): value is UnimodalRoutingMode =>
    (unimodalRoutingModes as readonly string[]).includes(value);

// The result of a mode other than transit
type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    TransitionRouteResponse['result']['walking']
>;

const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [UnimodalRoutingMode, UnimodalRouteResult] =>
    isUnimodalRoutingMode(entry[0]) && entry[1] !== undefined;

type TransitRouteResult = NonNullable<
    TransitionRouteResponse['result']['transit']
>;

const isTransitRouteResultEntry = (
    entry: [string, unknown],
): entry is ['transit', TransitRouteResult] =>
    entry[0] === 'transit' && entry[1] !== undefined;

// A mode unknown to the app becomes `other`
const getKnownMode = (mode: string): Api.Mode =>
    Api.ModeSchema.catch('other').parse(mode);

const createUnimodalStep = (
    routingMode: UnimodalRoutingMode,
    path: UnimodalRouteResult['paths'][number],
): Api.RouteStep => {
    switch (routingMode) {
        case 'walking':
            return {
                activity: 'walkingToDestination',
                geometry: path.geometry,
                durationSeconds: path.travelTimeSeconds,
                distanceMeters: path.distanceMeters,
            };
        case 'driving':
            return {
                activity: 'inVehicle',
                mode: routingMode,
                geometry: path.geometry,
                durationSeconds: path.travelTimeSeconds,
                distanceMeters: path.distanceMeters,
            };
        default:
            return routingMode satisfies never;
    }
};

const createTransitSteps = (
    path: TransitRouteResult['paths'][number],
    origin: Utils.Position,
    destination: Utils.Position,
): Api.RouteStep[] => {
    const steps: Api.RouteStep[] = [];
    let from = origin;
    path.steps.forEach((step, index) => {
        switch (step.action) {
            case 'walking': {
                const next = path.steps.at(index + 1);
                if (next?.action === 'boarding') {
                    const to = next.nodeCoordinates;
                    steps.push({
                        activity: 'walkingToStop',
                        boardingMode: getKnownMode(next.mode),
                        geometry: {
                            type: 'LineString',
                            coordinates: [from, to],
                        },
                        durationSeconds: step.travelTime,
                        distanceMeters: step.distance,
                    });
                    from = to;
                } else {
                    steps.push({
                        activity: 'walkingToDestination',
                        geometry: {
                            type: 'LineString',
                            coordinates: [from, destination],
                        },
                        durationSeconds: step.travelTime,
                        distanceMeters: step.distance,
                    });
                    from = destination;
                }
                break;
            }
            case 'boarding':
                steps.push({
                    activity: 'waitingAtStop',
                    boardingMode: getKnownMode(step.mode),
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
                    mode: getKnownMode(step.mode),
                    geometry: { type: 'LineString', coordinates: [from, to] },
                    durationSeconds: step.inVehicleTime,
                    distanceMeters: step.inVehicleDistance,
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
    origin: Utils.Position,
    destination: Utils.Position,
    routingSetupId: string,
): Api.RouteAlternative | null => {
    if (isUnimodalRouteResultEntry(entry)) {
        const [routingMode, result] = entry;
        const path = result.paths.at(0);
        if (!path) {
            return null;
        }
        return {
            id: `${routingSetupId}-${routingMode}`,
            steps: [createUnimodalStep(routingMode, path)],
        };
    }
    if (isTransitRouteResultEntry(entry)) {
        const [, result] = entry;
        const path = result.paths.at(0);
        if (!path) {
            return null;
        }
        return {
            id: `${routingSetupId}-transit`,
            steps: createTransitSteps(path, origin, destination),
        };
    }
    return null;
};

export const createRouteAlternatives = (
    { query, result }: TransitionRouteResponse,
    routingSetupId: string,
): Api.RouteAlternative[] => {
    const origin = query.originGeojson.geometry.coordinates;
    const destination = query.destinationGeojson.geometry.coordinates;
    return Object.entries(result).flatMap(
        (entry) =>
            createRouteAlternative(
                entry,
                origin,
                destination,
                routingSetupId,
            ) ?? [],
    );
};
