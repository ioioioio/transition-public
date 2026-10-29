import type { Api } from 'common';

export type RouteOrder = 'travelTime';

export interface RouteSummary {
    // Main one first
    rankedModes: Api.Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
}
