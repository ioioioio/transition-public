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
});

const createPlaneRouteAlternative = ({
    id,
    access,
    originAirport,
    flightSeconds,
    destinationAirport,
    egress,
}: {
    id: string;
    access: Api.RouteAlternative;
    originAirport: Airport;
    flightSeconds: number;
    destinationAirport: Airport;
    egress: Api.RouteAlternative;
}): Api.RouteAlternative => {
    const groundModes = [
        ...access.summary.rankedModes,
        ...egress.summary.rankedModes,
    ];
    return {
        id,
        summary: {
            rankedModes: [...new Set<Api.Mode>(['plane', ...groundModes])],
            travelTimeSeconds:
                access.summary.travelTimeSeconds +
                flightSeconds +
                egress.summary.travelTimeSeconds,
            distanceMeters:
                access.summary.distanceMeters +
                calculateDistanceMeters(
                    originAirport.position,
                    destinationAirport.position,
                ) +
                egress.summary.distanceMeters,
        },
        steps: [
            ...access.steps,
            createFlightStep(originAirport, destinationAirport, flightSeconds),
            ...egress.steps,
        ],
    };
};

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
    const flightSeconds = flight.minutes * 60;
    const alternatives = await Promise.all(
        modes.map(async (mode) => {
            const parts = await fetchAccessAndEgress({
                odTrip,
                boardingStation: originAirport,
                middleSeconds: flightSeconds,
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
                flightSeconds,
                destinationAirport,
                egress: parts.egress,
            });
        }),
    );
    return alternatives.filter((alternative) => alternative !== null);
};
