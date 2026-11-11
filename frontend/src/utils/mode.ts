import type { Icon } from '@phosphor-icons/react';
import type { Api } from 'common';

import airplaneSvg from '@/assets/mode-icons/airplane.svg?raw';
import busSvg from '@/assets/mode-icons/bus_city.svg?raw';
import carSvg from '@/assets/mode-icons/car_no_steering_wheel.svg?raw';
import personWalkingSvg from '@/assets/mode-icons/foot.svg?raw';
import highSpeedTrainSvg from '@/assets/mode-icons/hsr.svg?raw';
import questionMarkSvg from '@/assets/mode-icons/question_mark.svg?raw';
import subwaySvg from '@/assets/mode-icons/subway.svg?raw';
import trainSvg from '@/assets/mode-icons/train.svg?raw';
import { createIcon } from '@/components/icons/create-icon';

export const modeIcons: Record<Api.Mode, Icon> = {
    bus: createIcon(busSvg),
    driving: createIcon(carSvg),
    highSpeedRail: createIcon(highSpeedTrainSvg),
    metro: createIcon(subwaySvg),
    plane: createIcon(airplaneSvg),
    rail: createIcon(trainSvg),
    walking: createIcon(personWalkingSvg),
    // Any other means of transport
    other: createIcon(questionMarkSvg),
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
