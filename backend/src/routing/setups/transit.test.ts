import type { PublicConfig } from 'common';
import { it } from 'vitest';
import {
    createRouteFetcherForFakeTransition,
    expectStepsToConnect,
    fakeScenarioName,
    setUpFakeTransitionWithGaps,
} from './setup.test-utils';
import { fetchTransitSetupRoute } from './transit';

setUpFakeTransitionWithGaps();

const origin = { lng: 1, lat: 2 };
const destination = { lng: 9, lat: 8 };

const routingSetup: PublicConfig.TransitRoutingSetup = {
    id: 'transit',
    type: 'transit',
    scenarioName: fakeScenarioName,
};

it('connects the steps from the origin to the destination', async () => {
    const route = await fetchTransitSetupRoute(
        await createRouteFetcherForFakeTransition(routingSetup),
        {
            origin,
            destination,
            time: { type: 'departure', secondsSinceMidnight: 0 },
        },
        routingSetup,
    );
    expectStepsToConnect(route?.steps ?? null, origin, destination);
});
