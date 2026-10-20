import { type Api, Utils } from 'common';
import { fetchTransitionRoute, type OdTrip } from '../transition/route';
import { createRouteAlternatives } from '../transition/route-alternatives';
import { calculateDistanceMeters } from '../utils/geo';

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
    routingSetupId: string;
    scenarioId: string;
    mode: string;
};

// Null when there's no route with that mode
const fetchRouteWithMode = async (
    { routingSetupId, scenarioId, mode }: OdTripViaStations,
    odTrip: OdTrip,
) => {
    const transitionRoute = await fetchTransitionRoute(odTrip, {
        scenarioId,
        modes: [mode],
    });
    return (
        createRouteAlternatives(transitionRoute, routingSetupId).at(0) ?? null
    );
};

// Each part starts at the departure time or when the previous one ends
const fetchStepsFromDeparture = async (
    odTripViaStations: OdTripViaStations,
): Promise<Api.RouteStep[] | null> => {
    const { odTrip, boardingStation, fetchMiddleSteps, alightingStation } =
        odTripViaStations;
    const access = await fetchRouteWithMode(odTripViaStations, {
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: odTrip.time,
    });
    if (!access) {
        return null;
    }
    const middleDepartureSeconds =
        odTrip.time.secondsSinceMidnight +
        Utils.calculateTotalDurationSeconds(access.steps);
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
    const egress = await fetchRouteWithMode(odTripViaStations, {
        origin: alightingStation.position,
        destination: odTrip.destination,
        time: {
            type: 'departure',
            secondsSinceMidnight: egressDepartureSeconds,
        },
    });
    if (!egress) {
        return null;
    }
    return [...access.steps, ...middleSteps, ...egress.steps];
};

// Each part ends at the arrival time or when the next one starts
const fetchStepsFromArrival = async (
    odTripViaStations: OdTripViaStations,
): Promise<Api.RouteStep[] | null> => {
    const { odTrip, boardingStation, fetchMiddleSteps, alightingStation } =
        odTripViaStations;
    const egress = await fetchRouteWithMode(odTripViaStations, {
        origin: alightingStation.position,
        destination: odTrip.destination,
        time: odTrip.time,
    });
    if (!egress) {
        return null;
    }
    const middleArrivalSeconds =
        odTrip.time.secondsSinceMidnight -
        Utils.calculateTotalDurationSeconds(egress.steps);
    const middleSteps = await fetchMiddleSteps({
        type: 'arrival',
        secondsSinceMidnight: middleArrivalSeconds,
    });
    if (!middleSteps) {
        return null;
    }
    const accessArrivalSeconds =
        middleArrivalSeconds - Utils.calculateTotalDurationSeconds(middleSteps);
    const access = await fetchRouteWithMode(odTripViaStations, {
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: { type: 'arrival', secondsSinceMidnight: accessArrivalSeconds },
    });
    if (!access) {
        return null;
    }
    return [...access.steps, ...middleSteps, ...egress.steps];
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
