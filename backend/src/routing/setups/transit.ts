import type { Api, PublicConfig } from 'common';
import { fetchTransitRouteSteps, type OdTrip } from '../routes/fetch-routes';

export const fetchTransitRouteAlternatives = async (
    odTrip: OdTrip,
    { id, scenarioId }: PublicConfig.TransitRoutingSetup,
): Promise<Api.RouteAlternative[]> => {
    const steps = await fetchTransitRouteSteps(odTrip, scenarioId);
    if (!steps) {
        return [];
    }
    return [{ id, steps }];
};
