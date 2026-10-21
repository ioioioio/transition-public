import type { Api, PublicConfig } from 'common';
import { fetchTransitRoute, type OdTrip } from '../transition/route';
import { createRouteAlternatives } from '../transition/route-alternatives';

export const fetchTransitRouteAlternatives = async (
    odTrip: OdTrip,
    { id, scenarioId }: PublicConfig.TransitRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const transitionRoute = await fetchTransitRoute(odTrip, scenarioId);
    return createRouteAlternatives(transitionRoute, id);
};
