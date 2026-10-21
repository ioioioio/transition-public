import { Api, type PublicConfig, type Utils } from 'common';

import type { TransitionRouteResponse } from './route';

type TransitionRouteResult = TransitionRouteResponse['result'];

type UnimodalRouteResult = NonNullable<
    TransitionRouteResult[PublicConfig.UnimodalMode]
>;

type TransitRouteResult = NonNullable<TransitionRouteResult['transit']>;

// A mode unknown to the app becomes `other`
const getKnownMode = (mode: string): Api.Mode =>
    Api.ModeSchema.catch('other').parse(mode);

const createUnimodalStep = (
    routingMode: PublicConfig.UnimodalMode,
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

// Requests are for a single mode and without alternatives, so Transition
// should answer with at most one path, of that mode
const warnOfUnexpectedResults = (
    result: TransitionRouteResult,
    routingMode: PublicConfig.UnimodalMode | 'transit',
) => {
    const unexpectedModes = Object.keys(result).filter(
        (mode) => mode !== routingMode,
    );
    if (unexpectedModes.length > 0) {
        console.warn(
            `Transition answered for ${unexpectedModes.join(', ')}, besides ${routingMode}`,
        );
    }
    const pathCount = result[routingMode]?.paths.length ?? 0;
    if (pathCount > 1) {
        console.warn(
            `Transition answered with ${pathCount} paths for ${routingMode}, instead of one`,
        );
    }
};

// Null when no path was found
export const createUnimodalRouteSteps = (
    transitionRoute: TransitionRouteResponse,
    routingMode: PublicConfig.UnimodalMode,
): Api.RouteStep[] | null => {
    const { result } = transitionRoute;
    warnOfUnexpectedResults(result, routingMode);
    const path = result[routingMode]?.paths.at(0);
    if (!path) {
        return null;
    }
    return [createUnimodalStep(routingMode, path)];
};

// Null when no path was found
export const createTransitRouteSteps = (
    transitionRoute: TransitionRouteResponse,
): Api.RouteStep[] | null => {
    const { query, result } = transitionRoute;
    warnOfUnexpectedResults(result, 'transit');
    const path = result.transit?.paths.at(0);
    if (!path) {
        return null;
    }
    return createTransitSteps(
        path,
        query.originGeojson.geometry.coordinates,
        query.destinationGeojson.geometry.coordinates,
    );
};
