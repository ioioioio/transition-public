import type { Api, PublicConfig } from 'common';
import { fetchUnimodalRouteSteps, type OdTrip } from '../routes/fetch-routes';

export const fetchUnimodalSetupRoute = async (
    odTrip: OdTrip,
    { id, mode }: PublicConfig.UnimodalRoutingSetup,
): Promise<Api.Route | null> => {
    const steps = await fetchUnimodalRouteSteps(odTrip, mode);
    if (!steps) {
        return null;
    }
    return { id, steps };
};
