import type { ReactNode } from 'react';

import {
    LabeledCurve,
    type LabeledCurveStyles,
} from '@/components/map/labeled-curve';
import type { RouteStepData } from '@/types/route-step';

export type RouteStepProps = {
    id: string;
    step: RouteStepData;
    label?: ReactNode;
    styles: LabeledCurveStyles;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RouteStep = ({
    id,
    step,
    label,
    styles,
    selected,
    onLabelClick,
}: RouteStepProps) => {
    // Stops aren't drawn
    if (step.activity === 'waitingAtStop') {
        return null;
    }
    const { coordinates } = step.geometry;

    return (
        <LabeledCurve
            id={id}
            from={coordinates[0]!}
            to={coordinates[coordinates.length - 1]!}
            styles={styles}
            selected={selected}
            label={label}
            onLabelClick={onLabelClick}
        />
    );
};
