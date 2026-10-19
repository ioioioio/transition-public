import { type Api, Utils } from 'common';

import type {
    RouteAlternativeOrder,
    RouteSummary,
} from '@/features/trip-comparison/types/route-alternative';

const calculateDistanceMeters = (steps: Api.RouteStep[]) =>
    steps.reduce(
        (total, step) =>
            // Waiting covers no distance
            'distanceMeters' in step ? total + step.distanceMeters : total,
        0,
    );

// The vehicles' modes, by distance travelled, longest first, or walking when
// there's no vehicle
const rankModes = (steps: Api.RouteStep[]): Api.Mode[] => {
    const distances = new Map<Api.Mode, number>();
    for (const step of steps) {
        if (step.activity === 'inVehicle') {
            distances.set(
                step.mode,
                (distances.get(step.mode) ?? 0) + step.distanceMeters,
            );
        }
    }
    if (distances.size === 0) {
        return ['walking'];
    }
    return [...distances].sort(([, a], [, b]) => b - a).map(([mode]) => mode);
};

export const createRouteSummary = (steps: Api.RouteStep[]): RouteSummary => ({
    rankedModes: rankModes(steps),
    travelTimeSeconds: Utils.calculateTotalDurationSeconds(steps),
    distanceMeters: calculateDistanceMeters(steps),
});

const compareRouteAlternatives: Record<
    RouteAlternativeOrder,
    (a: Api.RouteAlternative, b: Api.RouteAlternative) => number
> = {
    travelTime: (a, b) =>
        Utils.calculateTotalDurationSeconds(a.steps) -
        Utils.calculateTotalDurationSeconds(b.steps),
};

export const sortRouteAlternatives = (
    alternatives: Api.RouteAlternative[],
    order: RouteAlternativeOrder,
): Api.RouteAlternative[] =>
    alternatives.toSorted(compareRouteAlternatives[order]);
