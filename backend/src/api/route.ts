import express from 'express';
import { Api, type PublicConfig } from 'common';
import { createRouteAlternatives } from '../transition/route-alternatives';
import { transitionToken } from '../transition/token';
import { postApiV1Route } from '../transition/generated/transitionAPI';
import * as TransitionSchema from '../transition/generated/transitionAPI.zod';
import type { PostApiV1RouteBody } from '../transition/generated/model';
import { config } from '../config';
import { createPointFeature } from '../utils/geo';
import { ApiError, parseRequest, parseUpstreamResponse } from '../utils/http';

const getRoutingSetup = (id: string): PublicConfig.RoutingSetup => {
    const routingSetup = config.routingSetups.find(
        (routingSetup) => routingSetup.id === id,
    );
    if (!routingSetup) {
        throw new ApiError(400, { error: `Unknown routing setup: ${id}` });
    }
    return routingSetup;
};

const checkTripHour = (hour: number) => {
    if (!config.tripHours.includes(hour)) {
        // Prevent users from trying arbitrary hours
        throw new ApiError(400, { error: `Unsupported trip hour: ${hour}` });
    }
};

const secondsPerHour = 60 * 60;

const createTransitionTime = ({ type, hour }: Api.TripTime) => {
    const secondsSinceMidnight = hour * secondsPerHour;
    return type === 'departure'
        ? { departureTimeSecondsSinceMidnight: secondsSinceMidnight }
        : { arrivalTimeSecondsSinceMidnight: secondsSinceMidnight };
};

const createTransitionRouteBody = (
    { origin, destination, time }: Api.RouteBody,
    routingSetup: PublicConfig.RoutingSetup,
): PostApiV1RouteBody => ({
    scenarioId: routingSetup.scenarioId,
    ...createTransitionTime(time),
    routingModes: routingSetup.modes,
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
    maxTotalTravelTimeSeconds: 172800,
});

const handleRoute = async (req: express.Request, res: express.Response) => {
    const body = parseRequest(Api.routeEndpoint.body, req.body);
    const routingSetup = getRoutingSetup(body.routingSetupId);
    checkTripHour(body.time.hour);
    const response = await postApiV1Route(
        createTransitionRouteBody(body, routingSetup),
        undefined,
        {
            headers: { Authorization: `Bearer ${transitionToken}` },
        },
    );
    if (response.status !== 200) {
        throw new ApiError(response.status, response.data);
    }
    const transitionResponse = parseUpstreamResponse(
        TransitionSchema.PostApiV1RouteResponse,
        response.data,
    );
    res.json(
        Api.routeEndpoint.response.parse({
            alternatives: createRouteAlternatives(
                transitionResponse,
                routingSetup.id,
            ),
        }),
    );
};

export const routeRouter = express.Router();
routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
