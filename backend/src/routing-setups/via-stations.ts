import { type Api, Utils } from 'common';
import {
    fetchTransitionRouteAlternatives,
    type OdTrip,
} from '../transition/route';
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
    // Between the boarding and the alighting stations
    middleSeconds: number;
    alightingStation: Station;
    routingSetupId: string;
    scenarioId: string;
    mode: string;
};

// Null when there's no route with that mode
const fetchRouteWithMode = async (
    { routingSetupId, scenarioId, mode }: OdTripViaStations,
    odTrip: OdTrip,
) =>
    (
        await fetchTransitionRouteAlternatives(
            odTrip,
            { scenarioId, modes: [mode] },
            routingSetupId,
        )
    ).at(0) ?? null;

type AccessAndEgress = {
    access: Api.RouteAlternative;
    egress: Api.RouteAlternative;
};

// The access starts at the departure time, and the egress once the middle
// part ends
const fetchFromDeparture = async (
    odTripViaStations: OdTripViaStations,
): Promise<AccessAndEgress | null> => {
    const { odTrip, boardingStation, middleSeconds, alightingStation } =
        odTripViaStations;
    const access = await fetchRouteWithMode(odTripViaStations, {
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: odTrip.time,
    });
    if (!access) {
        return null;
    }
    const egressDepartureSeconds =
        odTrip.time.secondsSinceMidnight +
        Utils.calculateTotalDurationSeconds(access.steps) +
        middleSeconds;
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
    return { access, egress };
};

// The egress ends at the arrival time, and the access when the middle part
// starts
const fetchFromArrival = async (
    odTripViaStations: OdTripViaStations,
): Promise<AccessAndEgress | null> => {
    const { odTrip, boardingStation, middleSeconds, alightingStation } =
        odTripViaStations;
    const egress = await fetchRouteWithMode(odTripViaStations, {
        origin: alightingStation.position,
        destination: odTrip.destination,
        time: odTrip.time,
    });
    if (!egress) {
        return null;
    }
    const accessArrivalSeconds =
        odTrip.time.secondsSinceMidnight -
        Utils.calculateTotalDurationSeconds(egress.steps) -
        middleSeconds;
    const access = await fetchRouteWithMode(odTripViaStations, {
        origin: odTrip.origin,
        destination: boardingStation.position,
        time: { type: 'arrival', secondsSinceMidnight: accessArrivalSeconds },
    });
    if (!access) {
        return null;
    }
    return { access, egress };
};

// Each part starts when the previous one ends, so the parts are fetched one
// after the other. Null when either part has no route with the mode
export const fetchAccessAndEgress = (
    odTripViaStations: OdTripViaStations,
): Promise<AccessAndEgress | null> =>
    odTripViaStations.odTrip.time.type === 'departure'
        ? fetchFromDeparture(odTripViaStations)
        : fetchFromArrival(odTripViaStations);
