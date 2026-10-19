import type { Api, PublicConfig } from 'common';
import { fetchAccessAndEgress, findClosestStation } from './via-stations';
import type { OdTrip } from '../transition/route';
import { calculateDistanceMeters } from '../utils/geo';

type Airport = PublicConfig.PlaneRoutingSetup['airports'][number];

const findFlight = (
    { flights }: PublicConfig.PlaneRoutingSetup,
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

const createPlaneRouteAlternative = ({
    id,
    access,
    originAirport,
    securityAndBoardingSeconds,
    flightSeconds,
    destinationAirport,
    unboardingAndLuggageSeconds,
    egress,
}: {
    id: string;
    access: Api.RouteAlternative;
    originAirport: Airport;
    securityAndBoardingSeconds: number;
    flightSeconds: number;
    destinationAirport: Airport;
    unboardingAndLuggageSeconds: number;
    egress: Api.RouteAlternative;
}): Api.RouteAlternative => ({
    id,
    steps: [
        ...access.steps,
        createBoardingStep(originAirport, securityAndBoardingSeconds),
        createFlightStep(originAirport, destinationAirport, flightSeconds),
        createUnboardingStep(destinationAirport, unboardingAndLuggageSeconds),
        ...egress.steps,
    ],
});

// One per mode, the same to and from the airports
export const fetchPlaneRouteAlternatives = async (
    odTrip: OdTrip,
    routingSetup: PublicConfig.PlaneRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const { id, scenarioId, modes, airports } = routingSetup;
    const originAirport = findClosestStation(airports, odTrip.origin);
    const destinationAirport = findClosestStation(airports, odTrip.destination);
    const flight = findFlight(routingSetup, originAirport, destinationAirport);
    if (originAirport === destinationAirport || !flight) {
        return [];
    }
    const securityAndBoardingSeconds =
        originAirport.securityAndBoardingMinutes * 60;
    const flightSeconds = flight.minutes * 60;
    const unboardingAndLuggageSeconds =
        destinationAirport.unboardingAndLuggageMinutes * 60;
    const alternatives = await Promise.all(
        modes.map(async (mode) => {
            const parts = await fetchAccessAndEgress({
                odTrip,
                boardingStation: originAirport,
                middleSeconds:
                    securityAndBoardingSeconds +
                    flightSeconds +
                    unboardingAndLuggageSeconds,
                alightingStation: destinationAirport,
                routingSetupId: id,
                scenarioId,
                mode,
            });
            if (!parts) {
                return null;
            }
            return createPlaneRouteAlternative({
                id: `${id}-${mode}`,
                access: parts.access,
                originAirport,
                securityAndBoardingSeconds,
                flightSeconds,
                destinationAirport,
                unboardingAndLuggageSeconds,
                egress: parts.egress,
            });
        }),
    );
    return alternatives.filter((alternative) => alternative !== null);
};
