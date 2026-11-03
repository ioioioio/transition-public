import type { Icon } from '@phosphor-icons/react';
import type { Api } from 'common';
import type { ReactNode } from 'react';

import {
    LabeledLineLayer,
    type LabeledLineLayerStyles,
    type LineEmphasis,
} from '@/components/map/labeled-line-layer';
import { createCurve } from '@/utils/geo';
import { modeColors } from '@/utils/mode';
import { getRouteStepMode } from '@/utils/route-step';

export interface RouteStepLayerStyles {
    line: LabeledLineLayerStyles;
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
}

export interface RouteStepLayerProps {
    id: string;
    step: Api.RouteStep;
    label?: ReactNode;
    icon: Icon;
    styles: RouteStepLayerStyles;
    emphasis: LineEmphasis;
    onClick?: () => void;
}

export const RouteStepLayer = ({
    id,
    step,
    label,
    icon,
    styles,
    emphasis,
    onClick,
}: RouteStepLayerProps) => {
    // Stops aren't drawn
    if (
        step.activity === 'waitingAtStop' ||
        step.activity === 'boarding' ||
        step.activity === 'unboarding'
    ) {
        return null;
    }
    const { coordinates } = step.geometry;
    const start = coordinates.at(0);
    const end = coordinates.at(-1);
    // A step known only by its ends is drawn as an arc between them
    const geometry =
        coordinates.length === 2 && start && end
            ? createCurve(start, end, styles.bend)
            : step.geometry;

    return (
        <LabeledLineLayer
            id={id}
            geometry={geometry}
            styles={styles.line}
            color={modeColors[getRouteStepMode(step)]}
            emphasis={emphasis}
            label={label}
            icon={icon}
            onClick={onClick}
        />
    );
};
