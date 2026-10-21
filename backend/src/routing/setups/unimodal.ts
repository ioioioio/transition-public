import type { Api, PublicConfig } from 'common';
import { fetchUnimodalRouteSteps, type OdTrip } from '../routes/fetch-routes';

export const fetchUnimodalRouteAlternatives = async (
    odTrip: OdTrip,
    { id, mode }: PublicConfig.UnimodalRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const steps = await fetchUnimodalRouteSteps(odTrip, mode);
    if (!steps) {
        return [];
    }
    return [{ id, steps }];
};
