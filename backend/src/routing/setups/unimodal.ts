import type { Api, PublicConfig } from 'common';
import type { OdTrip, RouteFetcher } from '../routes/fetch-routes';

export const fetchUnimodalSetupRoute = async (
    routeFetcher: RouteFetcher,
    odTrip: OdTrip,
    { id, mode }: PublicConfig.UnimodalRoutingSetup,
): Promise<Api.Route | null> => {
    const steps = await routeFetcher.fetchUnimodalRouteSteps(odTrip, mode);
    if (!steps) {
        return null;
    }
    return { id, steps };
};
