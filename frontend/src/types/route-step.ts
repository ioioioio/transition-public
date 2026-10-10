import type { LineString, Point } from 'geojson';

import type { Mode } from '@/utils/mode';

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

// A step of a route, by what's done during it
export type RouteStepData = WalkingStep | WaitingStep | VehicleStep;
