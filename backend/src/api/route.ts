import express from 'express';
import { Api, type PublicConfig } from 'common';
import {
    fetchPlaneTransitSetupRoute,
    fetchPlaneUnimodalSetupRoute,
} from '../routing/setups/plane';
import { fetchTransitSetupRoute } from '../routing/setups/transit';
import { fetchUnimodalSetupRoute } from '../routing/setups/unimodal';
import { fetchViaStationsSetupRoute } from '../routing/setups/via-stations';
import type { RouteFetcher } from '../routing/routes/fetch-routes';
import { ApiError, parseRequest } from '../utils/http';

const getRoutingSetup = (
    routingSetups: PublicConfig.RoutingSetup[],
    id: string,
): PublicConfig.RoutingSetup => {
    const routingSetup = routingSetups.find(
        (routingSetup) => routingSetup.id === id,
    );
    if (!routingSetup) {
        throw new ApiError(400, { error: `Unknown routing setup: ${id}` });
    }
    return routingSetup;
};

const getPlaneNetwork = (
    planeNetworks: PublicConfig.PlaneNetwork[],
    id: string,
): PublicConfig.PlaneNetwork => {
    const planeNetwork = planeNetworks.find(
        (planeNetwork) => planeNetwork.id === id,
    );
    if (!planeNetwork) {
        throw new Error(`Unknown plane network: ${id}`);
    }
    return planeNetwork;
};

const getStationNetwork = (
    stationNetworks: PublicConfig.StationNetwork[],
    id: string,
): PublicConfig.StationNetwork => {
    const stationNetwork = stationNetworks.find(
        (stationNetwork) => stationNetwork.id === id,
    );
    if (!stationNetwork) {
        throw new Error(`Unknown station network: ${id}`);
    }
    return stationNetwork;
};

const checkTripHour = (tripHours: number[], hour: number) => {
    if (!tripHours.includes(hour)) {
        // Prevent users from trying arbitrary hours
        throw new ApiError(400, { error: `Unsupported trip hour: ${hour}` });
    }
};

const secondsPerHour = 60 * 60;

const fetchSetupRoute = (
    routeFetcher: RouteFetcher,
    publicConfig: PublicConfig.PublicConfig,
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
            return fetchUnimodalSetupRoute(routeFetcher, odTrip, routingSetup);
        case 'transit':
            return fetchTransitSetupRoute(routeFetcher, odTrip, routingSetup);
        case 'plane-unimodal':
            return fetchPlaneUnimodalSetupRoute(
                routeFetcher,
                odTrip,
                routingSetup,
                getPlaneNetwork(
                    publicConfig.planeNetworks,
                    routingSetup.planeNetworkId,
                ),
            );
        case 'plane-transit':
            return fetchPlaneTransitSetupRoute(
                routeFetcher,
                odTrip,
                routingSetup,
                getPlaneNetwork(
                    publicConfig.planeNetworks,
                    routingSetup.planeNetworkId,
                ),
            );
        case 'via-stations':
            return fetchViaStationsSetupRoute(
                routeFetcher,
                odTrip,
                routingSetup,
                getStationNetwork(
                    publicConfig.stationNetworks,
                    routingSetup.stationNetworkId,
                ),
            );
        default:
            return routingSetup satisfies never;
    }
};

export const createRouteRouter = (
    routeFetcher: RouteFetcher,
    publicConfig: PublicConfig.PublicConfig,
) => {
    const handleRoute = async (req: express.Request, res: express.Response) => {
        const body = parseRequest(Api.routeEndpoint.body, req.body);
        const routingSetup = getRoutingSetup(
            publicConfig.routingSetups,
            body.routingSetupId,
        );
        checkTripHour(publicConfig.tripHours, body.time.hour);
        res.json(
            Api.routeEndpoint.response.parse({
                route: await fetchSetupRoute(
                    routeFetcher,
                    publicConfig,
                    body,
                    routingSetup,
                ),
            }),
        );
    };

    const routeRouter = express.Router();
    routeRouter[Api.routeEndpoint.method](Api.routeEndpoint.path, handleRoute);
    return routeRouter;
};
