import type { Api, Utils } from 'common';
import type { z } from 'zod';
import { config } from '../config';
import { ApiError, parseUpstreamResponse } from '../utils/http';
import { createPointFeature } from '../utils/geo';
import { postApiV1Route } from './generated/transitionAPI';
import * as TransitionSchema from './generated/transitionAPI.zod';
import type { PostApiV1RouteBody } from './generated/model';
import { transitionToken } from './token';

export type TransitionRouteResponse = z.infer<
    typeof TransitionSchema.PostApiV1RouteResponse
>;

export type OdTrip = {
    origin: Utils.LngLat;
    destination: Utils.LngLat;
    time: { type: Api.TripTimeType; secondsSinceMidnight: number };
};

export type RoutingParameters = {
    scenarioId: string;
    modes: string[];
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

const createTransitionRouteBody = (
    { origin, destination, time }: OdTrip,
    { scenarioId, modes }: RoutingParameters,
): PostApiV1RouteBody => ({
    scenarioId,
    ...createTransitionTime(time),
    routingModes: modes,
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
    maxTotalTravelTimeSeconds:
        config.transitionRouting.maxTotalTravelTimeSeconds,
});

export const fetchTransitionRoute = async (
    odTrip: OdTrip,
    parameters: RoutingParameters,
): Promise<TransitionRouteResponse> => {
    const response = await postApiV1Route(
        createTransitionRouteBody(odTrip, parameters),
        undefined,
        {
            headers: { Authorization: `Bearer ${transitionToken}` },
        },
    );
    if (response.status !== 200) {
        throw new ApiError(response.status, response.data);
    }
    return parseUpstreamResponse(
        TransitionSchema.PostApiV1RouteResponse,
        response.data,
    );
};
