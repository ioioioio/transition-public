import type { Api, PublicConfig, Utils } from 'common';
import { config } from '../../config';
import type { PostApiV1RouteBody } from '../../transition/generated/model';
import {
    postTransitionRoute,
    type TransitionRouteResponse,
} from '../../transition/route';
import { createPointFeature } from '../../utils/geo';

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
): PostApiV1RouteBody => ({
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

export const fetchUnimodalRoute = (
    { origin, destination }: Pick<OdTrip, 'origin' | 'destination'>,
    mode: PublicConfig.UnimodalMode,
): Promise<TransitionRouteResponse> => {
    return postTransitionRoute({
        routingModes: [mode],
        originGeojson: createPointFeature(origin),
        destinationGeojson: createPointFeature(destination),
    });
};
