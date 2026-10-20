import type { Api, PublicConfig } from 'common';
import { fetchTransitionRoute, type OdTrip } from '../transition/route';
import { createRouteAlternatives } from '../transition/route-alternatives';

export const fetchStandardRouteAlternatives = async (
    odTrip: OdTrip,
    { id, scenarioId, modes }: PublicConfig.StandardRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const transitionRoute = await fetchTransitionRoute(odTrip, {
        scenarioId,
        modes,
    });
    return createRouteAlternatives(transitionRoute, id);
};
