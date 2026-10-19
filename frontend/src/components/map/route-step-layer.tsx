import type { Api } from 'common';
import type { ReactNode } from 'react';

import {
    LabeledLineLayer,
    type LabeledLineLayerStyles,
} from '@/components/map/labeled-line-layer';
import { createCurve } from '@/utils/geo';

export type RouteStepLayerStyles = {
    line: LabeledLineLayerStyles;
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
};

export type RouteStepLayerProps = {
    id: string;
    step: Api.RouteStep;
    label?: ReactNode;
    styles: RouteStepLayerStyles;
    selected?: boolean;
    onClick?: () => void;
};

export const RouteStepLayer = ({
    id,
    step,
    label,
    styles,
    selected,
    onClick,
}: RouteStepLayerProps) => {
    // Stops aren't drawn
    if (step.activity === 'waitingAtStop') {
        return null;
    }
    const { coordinates } = step.geometry;
    const hasOnlyEnds = coordinates.length <= 2;
    const geometry = hasOnlyEnds
        ? createCurve(
              coordinates[0]!,
              coordinates[coordinates.length - 1]!,
              styles.bend,
          )
        : step.geometry;

    return (
        <LabeledLineLayer
            id={id}
            geometry={geometry}
            styles={styles.line}
            selected={selected}
            label={label}
            onClick={onClick}
        />
    );
};
