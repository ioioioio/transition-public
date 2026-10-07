import {
    CarIcon,
    PersonSimpleWalkIcon,
    type Icon,
} from '@phosphor-icons/react';

import type { RouteMode } from '@/features/trip-comparison/utils/route-result';

export const routeModeIcons: Record<RouteMode, Icon> = {
    driving: CarIcon,
    walking: PersonSimpleWalkIcon,
};
