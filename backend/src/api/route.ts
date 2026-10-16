import express from 'express';
import { Api, type PublicConfig } from 'common';
import { fetchTransitionRouteAlternatives } from '../transition/route';
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

const handleRoute = async (req: express.Request, res: express.Response) => {
    const { routingSetupId, origin, destination, time } = parseRequest(
        Api.routeEndpoint.body,
        req.body,
    );
    const routingSetup = getRoutingSetup(routingSetupId);
    checkTripHour(time.hour);
    const odTrip = {
        origin,
        destination,
        time: {
            type: time.type,
            secondsSinceMidnight: time.hour * secondsPerHour,
        },
    };
    const routingParameters = {
        scenarioId: routingSetup.scenarioId,
        modes: routingSetup.modes,
    };
    res.json(
        Api.routeEndpoint.response.parse({
            alternatives: await fetchTransitionRouteAlternatives(
                odTrip,
                routingParameters,
                routingSetup.id,
            ),
        }),
    );
};

export const routeRouter = express.Router();
routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
