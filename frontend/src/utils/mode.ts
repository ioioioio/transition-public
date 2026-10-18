import {
    AirplaneTiltIcon,
    BusIcon,
    CarIcon,
    PathIcon,
    PersonSimpleWalkIcon,
    SubwayIcon,
    TrainIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';

export const modeIcons: Record<Api.Mode, Icon> = {
    bus: BusIcon,
    driving: CarIcon,
    metro: SubwayIcon,
    plane: AirplaneTiltIcon,
    rail: TrainIcon,
    walking: PersonSimpleWalkIcon,
    // Any other means of transport
    other: PathIcon,
};
