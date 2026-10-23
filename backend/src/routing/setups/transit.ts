import type { Api, PublicConfig } from 'common';
import type { OdTrip, RouteFetcher } from '../routes/fetch-routes';

export const fetchTransitSetupRoute = async (
    routeFetcher: RouteFetcher,
    odTrip: OdTrip,
    { id, scenarioName, requiredModes }: PublicConfig.TransitRoutingSetup,
): Promise<Api.Route | null> => {
    const steps = await routeFetcher.fetchTransitRouteSteps(
        odTrip,
        scenarioName,
        requiredModes,
    );
    if (!steps) {
        return null;
    }
    return { id, steps };
};
