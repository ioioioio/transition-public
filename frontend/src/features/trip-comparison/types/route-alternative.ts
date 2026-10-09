import type { LineString, Point } from 'geojson';

import type { Mode } from '@/utils/mode';

export type RouteSummary = {
    // Main one first, by a chosen criterion
    rankedModes: Mode[];
    travelTimeSeconds: number;
    distanceMeters: number;
};

type WalkingStep = {
    activity: 'walkingToStop' | 'walkingToDestination';
    geometry: LineString;
    durationSeconds: number;
};

type WaitingStep = {
    activity: 'waitingAtStop';
    geometry: Point;
    durationSeconds: number;
};

type VehicleStep = {
    activity: 'inVehicle';
    mode: Mode;
    geometry: LineString;
    durationSeconds: number;
};

export type RouteAlternativeStep = WalkingStep | WaitingStep | VehicleStep;

// A way to make the trip
export type RouteAlternative = {
    id: string;
    summary: RouteSummary;
    steps: RouteAlternativeStep[];
};

export type RouteAlternativeOrder = 'travelTime';
