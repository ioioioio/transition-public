import type { Api } from 'common';

export type RouteOrder = 'travelTime';

export type RouteSummary = {
    // Main one first
    rankedModes: Api.Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
};
