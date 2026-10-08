import {
    CarIcon,
    PersonSimpleWalkIcon,
    type Icon,
} from '@phosphor-icons/react';

export const modes = ['driving', 'walking'] as const;

export type Mode = (typeof modes)[number];

export const isMode = (value: string): value is Mode =>
    (modes as readonly string[]).includes(value);

export const modeIcons: Record<Mode, Icon> = {
    driving: CarIcon,
    walking: PersonSimpleWalkIcon,
};
