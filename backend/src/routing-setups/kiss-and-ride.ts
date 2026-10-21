import type { Api, PublicConfig } from 'common';
import { config } from '../config';
import { fetchStepsViaStations, findClosestStation } from './via-stations';
import {
    fetchTransitRoute,
    type OdTrip,
    type TransitionRouteResponse,
} from '../transition/route';
import { createRouteAlternatives } from '../transition/route-alternatives';

type TransitPath = NonNullable<
    TransitionRouteResponse['result']['transit']
>['paths'][number];

const checkUsesRequiredModes = (path: TransitPath, requiredModes: string[]) => {
    const usedModes = new Set(
        path.steps.flatMap((step) =>
            step.action === 'boarding' ? [step.mode] : [],
        ),
    );
    return requiredModes.every((mode) => usedModes.has(mode));
};

export const fetchKissAndRideRouteAlternatives = async (
    odTrip: OdTrip,
    routingSetup: PublicConfig.KissAndRideRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const { id, scenarioId, requiredModes, trainNetworkId } = routingSetup;
    const trainNetwork = config.trainNetworks.find(
        ({ id }) => id === trainNetworkId,
    );
    if (!trainNetwork) {
        throw new Error(`Unknown train network: ${trainNetworkId}`);
    }
    const { stations } = trainNetwork;
    const originStation = findClosestStation(stations, odTrip.origin);
    const destinationStation = findClosestStation(stations, odTrip.destination);
    if (originStation === destinationStation) {
        return [];
    }
    const fetchMiddleSteps = async (time: OdTrip['time']) => {
        const transitionRoute = await fetchTransitRoute(
            {
                origin: originStation.position,
                destination: destinationStation.position,
                time,
            },
            scenarioId,
        );
        const path = transitionRoute.result.transit?.paths.at(0);
        if (!path || !checkUsesRequiredModes(path, requiredModes)) {
            return null;
        }
        return (
            createRouteAlternatives(transitionRoute, id).at(0)?.steps ?? null
        );
    };
    const steps = await fetchStepsViaStations({
        odTrip,
        boardingStation: originStation,
        fetchMiddleSteps,
        alightingStation: destinationStation,
        routingSetupId: id,
        scenarioId,
        accessMode: 'driving',
    });
    if (!steps) {
        return [];
    }
    return [{ id, steps }];
};
