import express from 'express';
import { Api } from 'common';
import { createRouteAlternatives } from '../transition/route-alternatives';
import { transitionToken } from '../transition/token';
import { postApiV1Route } from '../transition/generated/transitionAPI';
import * as TransitionSchema from '../transition/generated/transitionAPI.zod';
import type { PostApiV1RouteBody } from '../transition/generated/model';
import { config } from '../config';
import { createPointFeature } from '../utils/geo';
import { ApiError, parseRequest, parseUpstreamResponse } from '../utils/http';

// Only one routing setup is supported for now
const [routingSetup] = config.routingSetups;
if (routingSetup === undefined) {
    throw new Error('Missing routing setup in config');
}

const createTransitionTime = ({ type, secondsSinceMidnight }: Api.TripTime) =>
    type === 'departure'
        ? { departureTimeSecondsSinceMidnight: secondsSinceMidnight }
        : { arrivalTimeSecondsSinceMidnight: secondsSinceMidnight };

const createTransitionRouteBody = ({
    origin,
    destination,
    time,
}: Api.RouteBody): PostApiV1RouteBody => ({
    scenarioId: routingSetup.scenarioId,
    ...createTransitionTime(time),
    routingModes: routingSetup.modes,
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
    maxTotalTravelTimeSeconds: 172800,
});

const handleRoute = async (req: express.Request, res: express.Response) => {
    const body = parseRequest(Api.routeEndpoint.body, req.body);
    const response = await postApiV1Route(
        createTransitionRouteBody(body),
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
