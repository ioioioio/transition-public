import {
    AirplaneTiltIcon,
    BusIcon,
    CarIcon,
    PathIcon,
    PersonSimpleWalkIcon,
    SubwayIcon,
    TrainIcon,
    TrainSimpleIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';

export const modeIcons: Record<Api.Mode, Icon> = {
    bus: BusIcon,
    driving: CarIcon,
    highSpeedRail: TrainSimpleIcon,
    metro: SubwayIcon,
    plane: AirplaneTiltIcon,
    rail: TrainIcon,
    walking: PersonSimpleWalkIcon,
    // Any other means of transport
    other: PathIcon,
};

// The theme variables of each mode's line on the map
export const modeColors: Record<Api.Mode, `--${string}`> = {
    bus: '--mode-bus',
    driving: '--mode-driving',
    highSpeedRail: '--mode-high-speed-rail',
    metro: '--mode-metro',
    plane: '--mode-plane',
    rail: '--mode-rail',
    walking: '--mode-walking',
    // Like walking, as it's rare and not a mode of its own
    other: '--mode-walking',
};
