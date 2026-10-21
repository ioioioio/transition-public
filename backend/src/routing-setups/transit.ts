import type { Api, PublicConfig } from 'common';
import { fetchTransitRoute, type OdTrip } from '../transition/route';
import { createTransitRouteSteps } from '../transition/route-steps';

export const fetchTransitRouteAlternatives = async (
    odTrip: OdTrip,
    { id, scenarioId }: PublicConfig.TransitRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const transitionRoute = await fetchTransitRoute(odTrip, scenarioId);
    const steps = createTransitRouteSteps(transitionRoute);
    if (!steps) {
        return [];
    }
    return [{ id, steps }];
};
