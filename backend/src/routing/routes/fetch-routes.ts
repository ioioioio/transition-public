import type { Api, PublicConfig, Utils } from 'common';
import { config } from '../../config';
import {
    postTransitionRoute,
    type TransitionRouteBody,
    type TransitionRouteResponse,
} from '../../transition/route';
import { createPointFeature } from '../../utils/geo';
import {
    createTransitRouteSteps,
    createUnimodalRouteSteps,
} from './route-steps';

export type OdTrip = {
    origin: Utils.LngLat;
    destination: Utils.LngLat;
    time: { type: Api.TripTimeType; secondsSinceMidnight: number };
};

const createTransitionTime = ({
    type,
    secondsSinceMidnight,
}: OdTrip['time']) => {
    // Times computed from Transition's travel times have decimals, but it
    // only accepts whole seconds in requests
    const wholeSeconds = Math.round(secondsSinceMidnight);
    return type === 'departure'
        ? { departureTimeSecondsSinceMidnight: wholeSeconds }
        : { arrivalTimeSecondsSinceMidnight: wholeSeconds };
};

const createTransitTransitionRouteBody = (
    { origin, destination, time }: OdTrip,
    scenarioId: string,
): TransitionRouteBody => ({
    scenarioId,
    ...createTransitionTime(time),
    routingModes: ['transit'],
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
    maxTotalTravelTimeSeconds:
        config.transitionRouting.maxTotalTravelTimeSeconds,
});

export const fetchTransitRoute = (
    odTrip: OdTrip,
    scenarioId: string,
): Promise<TransitionRouteResponse> => {
    return postTransitionRoute(
        createTransitTransitionRouteBody(odTrip, scenarioId),
    );
};

const fetchUnimodalRoute = (
    { origin, destination }: Pick<OdTrip, 'origin' | 'destination'>,
    mode: PublicConfig.UnimodalMode,
): Promise<TransitionRouteResponse> => {
    return postTransitionRoute({
        routingModes: [mode],
        originGeojson: createPointFeature(origin),
        destinationGeojson: createPointFeature(destination),
    });
};

// Null when there's no route
export const fetchTransitRouteSteps = async (
    odTrip: OdTrip,
    scenarioId: string,
): Promise<Api.RouteStep[] | null> => {
    const transitionRoute = await fetchTransitRoute(odTrip, scenarioId);
    return createTransitRouteSteps(transitionRoute);
};

// Null when there's no route
export const fetchUnimodalRouteSteps = async (
    odTrip: Pick<OdTrip, 'origin' | 'destination'>,
    mode: PublicConfig.UnimodalMode,
): Promise<Api.RouteStep[] | null> => {
    const transitionRoute = await fetchUnimodalRoute(odTrip, mode);
    return createUnimodalRouteSteps(transitionRoute, mode);
};
