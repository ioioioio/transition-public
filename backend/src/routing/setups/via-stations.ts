import { type Api, type PublicConfig, Utils } from 'common';
import { config } from '../../config';
import type { TransitionRouteResponse } from '../../transition/route';
import {
    fetchTransitRoute,
    fetchUnimodalRouteSteps,
    type OdTrip,
} from '../routes/fetch-routes';
import { createTransitRouteSteps } from '../routes/route-steps';
import { calculateDistanceMeters } from '../../utils/geo';

// For trips that go through stations, like airports or train stations
type Station = { id: string; position: Utils.LngLat };

export const findClosestStation = <S extends Station>(
    stations: S[],
    position: Utils.LngLat,
) =>
    stations.reduce((closest, station) =>
        calculateDistanceMeters(station.position, position) <
        calculateDistanceMeters(closest.position, position)
            ? station
            : closest,
    );

type OdTripViaStations = {
    odTrip: OdTrip;
    boardingStation: Station;
    // Between the boarding and the alighting stations, starting at the given
    // time for a departure, or ending at it for an arrival. Null when there's
    // no way between them
    fetchMiddleSteps: (time: OdTrip['time']) => Promise<Api.RouteStep[] | null>;
    alightingStation: Station;
    // To the boarding station, or from the alighting one. Null when there's no
    // route
    fetchAccessEgressSteps: (odTrip: OdTrip) => Promise<Api.RouteStep[] | null>;
};

// Each part starts at the departure time or when the previous one ends
const fetchStepsFromDeparture = async (
    odTripViaStations: OdTripViaStations,
): Promise<Api.RouteStep[] | null> => {
    const {
        odTrip,
        boardingStation,
        fetchMiddleSteps,
        alightingStation,
        fetchAccessEgressSteps,
    } = odTripViaStations;
    const accessSteps = await fetchAccessEgressSteps({
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: odTrip.time,
    });
    if (!accessSteps) {
        return null;
    }
    const middleDepartureSeconds =
        odTrip.time.secondsSinceMidnight +
        Utils.calculateTotalDurationSeconds(accessSteps);
    const middleSteps = await fetchMiddleSteps({
        type: 'departure',
        secondsSinceMidnight: middleDepartureSeconds,
    });
    if (!middleSteps) {
        return null;
    }
    const egressDepartureSeconds =
        middleDepartureSeconds +
        Utils.calculateTotalDurationSeconds(middleSteps);
    const egressSteps = await fetchAccessEgressSteps({
        origin: alightingStation.position,
        destination: odTrip.destination,
        time: {
            type: 'departure',
            secondsSinceMidnight: egressDepartureSeconds,
        },
    });
    if (!egressSteps) {
        return null;
    }
    return [...accessSteps, ...middleSteps, ...egressSteps];
};

// Each part ends at the arrival time or when the next one starts
const fetchStepsFromArrival = async (
    odTripViaStations: OdTripViaStations,
): Promise<Api.RouteStep[] | null> => {
    const {
        odTrip,
        boardingStation,
        fetchMiddleSteps,
        alightingStation,
        fetchAccessEgressSteps,
    } = odTripViaStations;
    const egressSteps = await fetchAccessEgressSteps({
        origin: alightingStation.position,
        destination: odTrip.destination,
        time: odTrip.time,
    });
    if (!egressSteps) {
        return null;
    }
    const middleArrivalSeconds =
        odTrip.time.secondsSinceMidnight -
        Utils.calculateTotalDurationSeconds(egressSteps);
    const middleSteps = await fetchMiddleSteps({
        type: 'arrival',
        secondsSinceMidnight: middleArrivalSeconds,
    });
    if (!middleSteps) {
        return null;
    }
    const accessArrivalSeconds =
        middleArrivalSeconds - Utils.calculateTotalDurationSeconds(middleSteps);
    const accessSteps = await fetchAccessEgressSteps({
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: {
            type: 'arrival',
            secondsSinceMidnight: accessArrivalSeconds,
        },
    });
    if (!accessSteps) {
        return null;
    }
    return [...accessSteps, ...middleSteps, ...egressSteps];
};

// The steps to the boarding station, between the stations, and from the
// alighting one. Each part depends on the time of the previous one, so they're
// fetched one after the other. Null when a part has no route
export const fetchStepsViaStations = (
    odTripViaStations: OdTripViaStations,
): Promise<Api.RouteStep[] | null> =>
    odTripViaStations.odTrip.time.type === 'departure'
        ? fetchStepsFromDeparture(odTripViaStations)
        : fetchStepsFromArrival(odTripViaStations);

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

export const fetchViaStationsSetupRoute = async (
    odTrip: OdTrip,
    routingSetup: PublicConfig.ViaStationsRoutingSetup,
): Promise<Api.Route[]> => {
    const {
        id,
        accessEgressMode,
        scenarioId,
        requiredModes,
        stationNetworkId,
    } = routingSetup;
    const stationNetwork = config.stationNetworks.find(
        ({ id }) => id === stationNetworkId,
    );
    if (!stationNetwork) {
        throw new Error(`Unknown station network: ${stationNetworkId}`);
    }
    const { stations } = stationNetwork;
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
        return createTransitRouteSteps(transitionRoute);
    };
    const steps = await fetchStepsViaStations({
        odTrip,
        boardingStation: originStation,
        fetchMiddleSteps,
        alightingStation: destinationStation,
        fetchAccessEgressSteps: (accessOrEgress) =>
            fetchUnimodalRouteSteps(accessOrEgress, accessEgressMode),
    });
    if (!steps) {
        return [];
    }
    return [{ id, steps }];
};
