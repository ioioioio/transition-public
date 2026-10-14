import type { LineString, Point } from 'geojson';

import type { Mode } from '@/utils/mode';

type WalkingToStopStep = {
    activity: 'walkingToStop';
    // Of the vehicle boarded at the stop
    boardingMode: Mode;
    geometry: LineString;
    durationSeconds: number;
};

type WalkingToDestinationStep = {
    activity: 'walkingToDestination';
    geometry: LineString;
    durationSeconds: number;
};

type WaitingStep = {
    activity: 'waitingAtStop';
    // Of the vehicle waited for
    boardingMode: Mode;
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
export type RouteStepData =
    WalkingToStopStep | WalkingToDestinationStep | WaitingStep | VehicleStep;
