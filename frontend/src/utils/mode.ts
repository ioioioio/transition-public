import {
    BusIcon,
    CarIcon,
    PathIcon,
    PersonSimpleWalkIcon,
    type Icon,
} from '@phosphor-icons/react';

export const modes = ['bus', 'driving', 'walking', 'other'] as const;

export type Mode = (typeof modes)[number];

export const isMode = (value: string): value is Mode =>
    (modes as readonly string[]).includes(value);

export const modeIcons: Record<Mode, Icon> = {
    bus: BusIcon,
    driving: CarIcon,
    walking: PersonSimpleWalkIcon,
    // Any other means of transport
    other: PathIcon,
};
