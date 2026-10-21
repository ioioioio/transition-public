import express from 'express';
import { Api, type PublicConfig } from 'common';
import { fetchKissAndRideRouteAlternatives } from '../routing-setups/kiss-and-ride';
import { fetchPlaneRouteAlternatives } from '../routing-setups/plane';
import { fetchTransitRouteAlternatives } from '../routing-setups/transit';
import { fetchUnimodalRouteAlternatives } from '../routing-setups/unimodal';
import { config } from '../config';
import { ApiError, parseRequest } from '../utils/http';

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

const fetchRouteAlternatives = (
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
            return fetchUnimodalRouteAlternatives(odTrip, routingSetup);
        case 'transit':
            return fetchTransitRouteAlternatives(odTrip, routingSetup);
        case 'plane':
            return fetchPlaneRouteAlternatives(odTrip, routingSetup);
        case 'kiss-and-ride':
            return fetchKissAndRideRouteAlternatives(odTrip, routingSetup);
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
            alternatives: await fetchRouteAlternatives(body, routingSetup),
        }),
    );
};

export const routeRouter = express.Router();
routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
