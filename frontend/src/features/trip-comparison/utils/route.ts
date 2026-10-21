import { type Api, Utils } from 'common';

import type {
    RouteOrder,
    RouteSummary,
} from '@/features/trip-comparison/types/route';

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
        case 'unboarding':
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

const compareRoutes: Record<
    RouteOrder,
    (a: Api.Route, b: Api.Route) => number
> = {
    travelTime: (a, b) =>
        Utils.calculateTotalDurationSeconds(a.steps) -
        Utils.calculateTotalDurationSeconds(b.steps),
};

export const sortRoutes = (
    routes: Api.Route[],
    order: RouteOrder,
): Api.Route[] => routes.toSorted(compareRoutes[order]);
