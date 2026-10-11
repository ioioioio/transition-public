import type { ReactNode } from 'react';

import {
    LabeledLine,
    type LabeledLineStyles,
} from '@/components/map/labeled-line';
import type { RouteStepData } from '@/types/route-step';
import { createCurve } from '@/utils/geo';

export type RouteStepStyles = LabeledLineStyles & {
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
};

export type RouteStepProps = {
    id: string;
    step: RouteStepData;
    label?: ReactNode;
    styles: RouteStepStyles;
    selected?: boolean;
    onClick?: () => void;
};

export const RouteStep = ({
    id,
    step,
    label,
    styles,
    selected,
    onClick,
}: RouteStepProps) => {
    // Stops aren't drawn
    if (step.activity === 'waitingAtStop') {
        return null;
    }
    const { coordinates } = step.geometry;

    return (
        <LabeledLine
            id={id}
            // An arc between its ends
            line={createCurve(
                coordinates[0]!,
                coordinates[coordinates.length - 1]!,
                styles.bend,
            )}
            styles={styles}
            selected={selected}
            label={label}
            onClick={onClick}
        />
    );
};
