import express from 'express';
import { Api, type PublicConfig } from 'common';
import {
    fetchPlaneTransitSetupRoute,
    fetchPlaneUnimodalSetupRoute,
} from '../routing/setups/plane';
import { fetchTransitSetupRoute } from '../routing/setups/transit';
import { fetchUnimodalSetupRoute } from '../routing/setups/unimodal';
import { fetchViaStationsSetupRoute } from '../routing/setups/via-stations';
import { config } from '../config';
import { ApiError, parseRequest } from '../utils/http';

const getRoutingSetup = (id: string): PublicConfig.RoutingSetup => {
    const routingSetup = config.public.routingSetups.find(
        (routingSetup) => routingSetup.id === id,
    );
    if (!routingSetup) {
        throw new ApiError(400, { error: `Unknown routing setup: ${id}` });
    }
    return routingSetup;
};

const checkTripHour = (hour: number) => {
    if (!config.public.tripHours.includes(hour)) {
        // Prevent users from trying arbitrary hours
        throw new ApiError(400, { error: `Unsupported trip hour: ${hour}` });
    }
};

const secondsPerHour = 60 * 60;

const fetchSetupRoute = (
    { origin, destination, time }: Api.RouteBody,
    routingSetup: PublicConfig.RoutingSetup,
) => {
    const odTrip = {
        origin,
        destination,
        time: {
            type: time.type,
            secondsSinceMidnight: time.hour * secondsPerHour,
        },
    };
    switch (routingSetup.type) {
        case 'unimodal':
            return fetchUnimodalSetupRoute(odTrip, routingSetup);
        case 'transit':
            return fetchTransitSetupRoute(odTrip, routingSetup);
        case 'plane-unimodal':
            return fetchPlaneUnimodalSetupRoute(odTrip, routingSetup);
        case 'plane-transit':
            return fetchPlaneTransitSetupRoute(odTrip, routingSetup);
        case 'via-stations':
            return fetchViaStationsSetupRoute(odTrip, routingSetup);
        default:
            return routingSetup satisfies never;
    }
};

const handleRoute = async (req: express.Request, res: express.Response) => {
    const body = parseRequest(Api.routeEndpoint.body, req.body);
    const routingSetup = getRoutingSetup(body.routingSetupId);
    checkTripHour(body.time.hour);
    res.json(
        Api.routeEndpoint.response.parse({
            route: await fetchSetupRoute(body, routingSetup),
        }),
    );
};

export const createRouteRouter = () => {
    const routeRouter = express.Router();
    routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
    return routeRouter;
};
