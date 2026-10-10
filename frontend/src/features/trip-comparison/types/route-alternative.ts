import type { RouteStepData } from '@/types/route-step';
import type { Mode } from '@/utils/mode';

export type RouteSummary = {
    // Main one first, by a chosen criterion
    rankedModes: Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
};

// A way to make the trip
export type RouteAlternative = {
    id: string;
    summary: RouteSummary;
    steps: RouteStepData[];
};

export type RouteAlternativeOrder = 'travelTime';
