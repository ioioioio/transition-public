import type { Api, PublicConfig } from 'common';
import { fetchUnimodalRoute, type OdTrip } from '../transition/route';
import { createRouteAlternatives } from '../transition/route-alternatives';

export const fetchUnimodalRouteAlternatives = async (
    odTrip: OdTrip,
    { id, mode }: PublicConfig.UnimodalRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const transitionRoute = await fetchUnimodalRoute(odTrip, mode);
    return createRouteAlternatives(transitionRoute, id);
};
