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

// Null when the step covers no distance
const getStepMode = (step: Api.RouteStep): Api.Mode | null => {
    switch (step.activity) {
        case 'walkingToStop':
        case 'walkingToDestination':
            return 'walking';
        case 'waitingAtStop':
        case 'boarding':
            return null;
        case 'inVehicle':
            return step.mode;
        default:
            return step satisfies never;
    }
};

// By distance travelled, longest first
const rankModes = (steps: Api.RouteStep[]): Api.Mode[] => {
    const distances = new Map<Api.Mode, number>();
    for (const step of steps) {
        const mode = getStepMode(step);
        if (mode !== null && 'distanceMeters' in step) {
            distances.set(
                mode,
                (distances.get(mode) ?? 0) + step.distanceMeters,
            );
        }
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
