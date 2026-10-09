import type { RouteStepData } from '@/components/map/route-step';
import type { RoutingMode } from '@/features/trip-comparison/utils/route-result';
import type { Mode } from '@/utils/mode';

export type RouteSummary = {
    // Main one first, by a chosen criterion
    rankedModes: Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
};

// A way to make the trip
export type RouteAlternative = {
    id: RoutingMode;
    summary: RouteSummary;
    steps: RouteStepData[];
};
