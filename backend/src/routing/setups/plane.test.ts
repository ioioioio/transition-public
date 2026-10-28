import type { PublicConfig } from 'common';
import { it } from 'vitest';
import {
    fetchPlaneTransitSetupRoute,
    fetchPlaneUnimodalSetupRoute,
} from './plane';
import {
    createRouteFetcherForFakeTransition,
    expectStepsToConnect,
    fakeScenarioName,
    setUpFakeTransitionWithGaps,
} from './setup.test-utils';

setUpFakeTransitionWithGaps();

const origin = { lng: 1, lat: 2 };
const destination = { lng: 7, lat: 8 };

const odTrip = {
    origin,
    destination,
    time: { type: 'departure' as const, secondsSinceMidnight: 0 },
};

const planeNetwork: PublicConfig.PlaneNetwork = {
    id: 'plane-network',
    airports: [
        {
            id: 'near-origin',
            position: { lng: 3, lat: 4 },
            securityAndBoardingMinutes: 1,
            unboardingAndLuggageMinutes: 1,
        },
        {
            id: 'near-destination',
            position: { lng: 5, lat: 6 },
            securityAndBoardingMinutes: 1,
            unboardingAndLuggageMinutes: 1,
        },
    ],
    flights: [{ between: ['near-origin', 'near-destination'], minutes: 1 }],
};

it('connects the steps through the airports, driving to and from them', async () => {
    const routingSetup: PublicConfig.PlaneUnimodalRoutingSetup = {
        id: 'plane-driving',
        type: 'plane-unimodal',
        planeNetworkId: planeNetwork.id,
        mode: 'driving',
    };
    const route = await fetchPlaneUnimodalSetupRoute(
        await createRouteFetcherForFakeTransition(routingSetup),
        odTrip,
        routingSetup,
        planeNetwork,
    );
    expectStepsToConnect(route?.steps ?? null, origin, destination);
});

it('connects the steps through the airports, by transit to and from them', async () => {
    const routingSetup: PublicConfig.PlaneTransitRoutingSetup = {
        id: 'plane-transit',
        type: 'plane-transit',
        planeNetworkId: planeNetwork.id,
        scenarioName: fakeScenarioName,
    };
    const route = await fetchPlaneTransitSetupRoute(
        await createRouteFetcherForFakeTransition(routingSetup),
        odTrip,
        routingSetup,
        planeNetwork,
    );
    expectStepsToConnect(route?.steps ?? null, origin, destination);
});
