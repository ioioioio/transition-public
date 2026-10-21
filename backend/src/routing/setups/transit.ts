import type { Api, PublicConfig } from 'common';
import { fetchTransitRouteSteps, type OdTrip } from '../routes/fetch-routes';

export const fetchTransitSetupRoute = async (
    odTrip: OdTrip,
    { id, scenarioId }: PublicConfig.TransitRoutingSetup,
): Promise<Api.Route | null> => {
    const steps = await fetchTransitRouteSteps(odTrip, scenarioId);
    if (!steps) {
        return null;
    }
    return { id, steps };
};
