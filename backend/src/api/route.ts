import express from 'express';
import { Api } from 'common';
import { transitionToken } from '../transition/token';
import { postApiV1Route } from '../transition/generated/transitionAPI';
import type { PostApiV1RouteBody } from '../transition/generated/model';
import { getEnv, getListEnv } from '../utils/env';
import { createPointFeature } from '../utils/geo';
import { ApiError, parseRequest, parseUpstreamResponse } from '../utils/http';

const scenarioId = getEnv('TRANSITION_SCENARIO_1_ID');
const routingModes = getListEnv('TRANSITION_SCENARIO_1_MODES');

// Temporary fixed times, until the frontend sends them.
const departureTimeSecondsSinceMidnight = 8 * 60 * 60;

const createTransitionRouteBody = ({
    origin,
    destination,
}: Api.RouteBody): PostApiV1RouteBody => ({
    scenarioId,
    departureTimeSecondsSinceMidnight,
    routingModes,
    originGeojson: createPointFeature(origin),
    destinationGeojson: createPointFeature(destination),
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
    res.json(parseUpstreamResponse(Api.routeEndpoint.response, response.data));
};

export const routeRouter = express.Router();
routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
