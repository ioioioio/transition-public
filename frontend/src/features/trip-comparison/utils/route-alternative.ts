import type { Api } from 'common';

import type { RouteAlternativeOrder } from '@/features/trip-comparison/types/route-alternative';

const compareRouteAlternatives: Record<
    RouteAlternativeOrder,
    (a: Api.RouteAlternative, b: Api.RouteAlternative) => number
> = {
    travelTime: (a, b) =>
        a.summary.travelTimeSeconds - b.summary.travelTimeSeconds,
};

export const sortRouteAlternatives = (
    alternatives: Api.RouteAlternative[],
    order: RouteAlternativeOrder,
): Api.RouteAlternative[] =>
    alternatives.toSorted(compareRouteAlternatives[order]);
