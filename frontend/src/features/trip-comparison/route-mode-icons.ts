import {
    CarIcon,
    PersonSimpleWalkIcon,
    type Icon,
} from '@phosphor-icons/react';

import type { RouteMode } from '@/features/trip-comparison/types';

export const routeModeIcons: Record<RouteMode, Icon> = {
    driving: CarIcon,
    walking: PersonSimpleWalkIcon,
};
