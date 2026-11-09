import {
    ClockIcon,
    IdentificationCardIcon,
    SuitcaseRollingIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';
import type { LineString } from 'geojson';

import { createCurve, createLngLat } from '@/utils/geo';
import { modeIcons } from '@/utils/mode';

// A step that goes somewhere, rather than one at a stop
export type TravelRouteStep = Extract<
    Api.RouteStep,
    { activity: 'walkingToStop' | 'walkingToDestination' | 'inVehicle' }
>;

export const isTravelRouteStep = (
    step: Api.RouteStep,
): step is TravelRouteStep =>
    step.activity === 'walkingToStop' ||
    step.activity === 'walkingToDestination' ||
    step.activity === 'inVehicle';

export const getRouteStepMode = (step: TravelRouteStep): Api.Mode => {
    switch (step.activity) {
        case 'walkingToStop':
        case 'walkingToDestination':
            return 'walking';
        case 'inVehicle':
            return step.mode;
        default:
            return step satisfies never;
    }
};

export const getRouteStepIcon = (step: Api.RouteStep): Icon => {
    switch (step.activity) {
        case 'walkingToStop':
        case 'walkingToDestination':
        case 'inVehicle':
            return modeIcons[getRouteStepMode(step)];
        case 'waitingAtStop':
            return ClockIcon;
        case 'boarding':
            return IdentificationCardIcon;
        case 'unboarding':
            return SuitcaseRollingIcon;
        default:
            return step satisfies never;
    }
};

/**
 * Creates the line a step is drawn as.
 *
 * @param step - The step to draw.
 * @param arcBend - How far the arc bends, for a step known only by its ends. See `createCurve`.
 * @returns The step's own geometry, or an arc when it's known only by its ends.
 */
export const createRouteStepGeometry = (
    step: TravelRouteStep,
    arcBend: number,
): LineString => {
    const { coordinates } = step.geometry;
    const start = coordinates.at(0);
    const end = coordinates.at(-1);
    return coordinates.length === 2 && start && end
        ? createCurve(createLngLat(start), createLngLat(end), arcBend)
        : step.geometry;
};

/**
 * Creates the line a whole path is drawn as, from its steps' lines.
 *
 * @param steps - The path's steps, in order. Each starts where the previous one ends.
 * @param arcBend - See `createRouteStepGeometry`.
 */
export const createRoutePathGeometry = (
    steps: Api.RouteStep[],
    arcBend: number,
): LineString => ({
    type: 'LineString',
    coordinates: steps
        .filter(isTravelRouteStep)
        .flatMap((step) => createRouteStepGeometry(step, arcBend).coordinates),
});
