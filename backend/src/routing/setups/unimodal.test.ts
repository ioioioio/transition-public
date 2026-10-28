import type { PublicConfig } from 'common';
import { it } from 'vitest';
import {
    createRouteFetcherForFakeTransition,
    expectStepsToConnect,
    setUpFakeTransitionWithGaps,
} from './setup.test-utils';
import { fetchUnimodalSetupRoute } from './unimodal';

setUpFakeTransitionWithGaps();

const origin = { lng: 1, lat: 2 };
const destination = { lng: 9, lat: 8 };

const routingSetup: PublicConfig.UnimodalRoutingSetup = {
    id: 'driving',
    type: 'unimodal',
    mode: 'driving',
};

it('connects the steps from the origin to the destination', async () => {
    const route = await fetchUnimodalSetupRoute(
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
