import type { Api, PublicConfig } from 'common';
import { config } from '../config';
import { fetchStepsViaStations, findClosestStation } from './via-stations';
import type { OdTrip } from '../transition/route';
import { calculateDistanceMeters } from '../utils/geo';

type Airport = PublicConfig.PlaneNetwork['airports'][number];

const findFlight = (
    { flights }: PublicConfig.PlaneNetwork,
    from: Airport,
    to: Airport,
) =>
    flights.find(
        ({ between }) => between.includes(from.id) && between.includes(to.id),
    );

const createBoardingStep = (
    airport: Airport,
    durationSeconds: number,
): Api.RouteStep => ({
    activity: 'boarding',
    boardingMode: 'plane',
    geometry: {
        type: 'Point',
        coordinates: [airport.position.lng, airport.position.lat],
    },
    durationSeconds,
});

const createUnboardingStep = (
    airport: Airport,
    durationSeconds: number,
): Api.RouteStep => ({
    activity: 'unboarding',
    unboardingMode: 'plane',
    geometry: {
        type: 'Point',
        coordinates: [airport.position.lng, airport.position.lat],
    },
    durationSeconds,
});

const createFlightStep = (
    from: Airport,
    to: Airport,
    durationSeconds: number,
): Api.RouteStep => ({
    activity: 'inVehicle',
    mode: 'plane',
    geometry: {
        type: 'LineString',
        coordinates: [
            [from.position.lng, from.position.lat],
            [to.position.lng, to.position.lat],
        ],
    },
    durationSeconds,
    distanceMeters: calculateDistanceMeters(from.position, to.position),
});

// One per mode, the same to and from the airports
export const fetchPlaneRouteAlternatives = async (
    odTrip: OdTrip,
    routingSetup: PublicConfig.PlaneRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const { id, scenarioId, modes, planeNetworkId } = routingSetup;
    const planeNetwork = config.planeNetworks.find(
        ({ id }) => id === planeNetworkId,
    );
    if (!planeNetwork) {
        throw new Error(`Unknown plane network: ${planeNetworkId}`);
    }
    const { airports } = planeNetwork;
    const originAirport = findClosestStation(airports, odTrip.origin);
    const destinationAirport = findClosestStation(airports, odTrip.destination);
    const flight = findFlight(planeNetwork, originAirport, destinationAirport);
    if (originAirport === destinationAirport || !flight) {
        return [];
    }
    const securityAndBoardingSeconds =
        originAirport.securityAndBoardingMinutes * 60;
    const flightSeconds = flight.minutes * 60;
    const unboardingAndLuggageSeconds =
        destinationAirport.unboardingAndLuggageMinutes * 60;
    // The same whenever the trip to the airport ends
    const fetchMiddleSteps = () =>
        Promise.resolve([
            createBoardingStep(originAirport, securityAndBoardingSeconds),
            createFlightStep(originAirport, destinationAirport, flightSeconds),
            createUnboardingStep(
                destinationAirport,
                unboardingAndLuggageSeconds,
            ),
        ]);
    const alternatives = await Promise.all(
        modes.map(async (mode): Promise<Api.RouteAlternative | null> => {
            const steps = await fetchStepsViaStations({
                odTrip,
                boardingStation: originAirport,
                fetchMiddleSteps,
                alightingStation: destinationAirport,
                routingSetupId: id,
                scenarioId,
                mode,
            });
            if (!steps) {
                return null;
            }
            return { id: `${id}-${mode}`, steps };
        }),
    );
    return alternatives.filter((alternative) => alternative !== null);
};
