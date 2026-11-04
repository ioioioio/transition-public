import {
    ClockIcon,
    IdentificationCardIcon,
    SuitcaseRollingIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';

import { modeIcons } from '@/utils/mode';

// A step that goes somewhere, rather than one at a stop
export type TravelRouteStep = Extract<
    Api.RouteStep,
    { activity: 'walkingToStop' | 'walkingToDestination' | 'inVehicle' }
>;

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
