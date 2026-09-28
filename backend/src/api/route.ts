import express from 'express';
import { Api } from 'common';
import { transitionToken } from '../transition/token';
import { postApiV1Route } from '../transition/generated/transitionAPI';
import type { PostApiV1RouteBody } from '../transition/generated/model';
import { toPointFeature } from '../utils/geo';

const toTransitionRouteBody = ({
    origin,
    destination,
}: Api.RouteBody): PostApiV1RouteBody => ({
    routingModes: ['driving', 'walking'], // temporary hardcoded modes
    originGeojson: toPointFeature(origin),
    destinationGeojson: toPointFeature(destination),
});

const handleRoute = async (
    req: express.Request<object, unknown, unknown>,
    res: express.Response,
) => {
    const request = Api.routeEndpoint.body.safeParse(req.body);
    if (!request.success) {
        res.status(400).json({ error: request.error.issues });
        return;
    }
    const response = await postApiV1Route(
        toTransitionRouteBody(request.data),
        undefined,
        {
            headers: { Authorization: `Bearer ${transitionToken}` },
        },
    );
    if (response.status !== 200) {
        res.status(response.status).json(response.data);
        return;
    }
    const route = Api.routeEndpoint.response.safeParse(response.data);
    if (!route.success) {
        res.status(502).json({ error: route.error.issues });
        return;
    }
    res.json(route.data);
};

export const routeRouter = express.Router();
routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
