import {
    ClockIcon,
    IdentificationCardIcon,
    SuitcaseRollingIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';

import { modeIcons } from '@/utils/mode';

export const getRouteStepIcon = (step: Api.RouteStep): Icon => {
    switch (step.activity) {
        case 'walkingToStop':
        case 'walkingToDestination':
            return modeIcons.walking;
        case 'waitingAtStop':
            return ClockIcon;
        case 'boarding':
            return IdentificationCardIcon;
        case 'unboarding':
            return SuitcaseRollingIcon;
        case 'inVehicle':
            return modeIcons[step.mode];
        default:
            return step satisfies never;
    }
};
