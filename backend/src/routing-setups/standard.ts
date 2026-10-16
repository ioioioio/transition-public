import type { Api, PublicConfig } from 'common';
import {
    fetchTransitionRouteAlternatives,
    type OdTrip,
} from '../transition/route';

export const fetchStandardRouteAlternatives = (
    odTrip: OdTrip,
    { id, scenarioId, modes }: PublicConfig.StandardRoutingSetup,
): Promise<Api.RouteAlternative[]> =>
    fetchTransitionRouteAlternatives(odTrip, { scenarioId, modes }, id);
