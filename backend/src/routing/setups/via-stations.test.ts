import type { Api, PublicConfig } from 'common';
import { it } from 'vitest';
import {
    createRouteFetcherForFakeTransition,
    expectStepsToConnect,
    fakeScenarioName,
    setUpFakeTransitionWithGaps,
} from './setup.test-utils';
import { fetchViaStationsSetupRoute } from './via-stations';

setUpFakeTransitionWithGaps();

const origin = { lng: 1, lat: 2 };
const destination = { lng: 7, lat: 8 };

const stationNetwork: PublicConfig.StationNetwork = {
    id: 'station-network',
    stations: [
        { id: 'near-origin', position: { lng: 3, lat: 4 } },
        { id: 'near-destination', position: { lng: 5, lat: 6 } },
    ],
};

const routingSetup: PublicConfig.ViaStationsRoutingSetup = {
    id: 'via-stations',
    type: 'via-stations',
    scenarioName: fakeScenarioName,
    // The mode of the fake Transition's line
    requiredModes: ['bus'],
    stationNetworkId: stationNetwork.id,
    accessEgressMode: 'driving',
};

it.each<Api.TripTimeType>(['departure', 'arrival'])(
    'connects the steps through the stations, from the %s time',
    async (timeType) => {
        const route = await fetchViaStationsSetupRoute(
            await createRouteFetcherForFakeTransition(routingSetup),
            {
                origin,
                destination,
                time: { type: timeType, secondsSinceMidnight: 0 },
            },
            routingSetup,
            stationNetwork,
        );
        expectStepsToConnect(route?.steps ?? null, origin, destination);
    },
);
