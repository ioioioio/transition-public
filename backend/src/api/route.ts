import express from 'express';
import { Api } from 'common';
import { transitionToken } from '../transition/token';
import { postApiV1Route } from '../transition/generated/transitionAPI';
import type { PostApiV1RouteBody } from '../transition/generated/model';
import { getListEnv } from '../utils/env';
import { createPointFeature } from '../utils/geo';
import { ApiError, parseRequest, parseUpstreamResponse } from '../utils/http';

const routingModes = getListEnv('TRANSITION_SCENARIO_1_MODES');

const createTransitionRouteBody = ({
    origin,
    destination,
}: Api.RouteBody): PostApiV1RouteBody => ({
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
