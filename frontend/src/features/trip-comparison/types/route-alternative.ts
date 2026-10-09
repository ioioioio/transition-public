import type { LineString } from 'geojson';

import type { Mode } from '@/utils/mode';

export type RouteSummary = {
    // Main one first, by a chosen criterion
    rankedModes: Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
};

export type RouteAlternativeStep = {
    geometry: LineString;
    mode: Mode;
    travelTimeSeconds: number;
};

// A way to make the trip
export type RouteAlternative = {
    id: string;
    summary: RouteSummary;
    steps: RouteAlternativeStep[];
};

export type RouteAlternativeOrder = 'travelTime';
