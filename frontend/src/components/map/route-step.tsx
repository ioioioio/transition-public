import type { ReactNode } from 'react';

import {
    LabeledLine,
    type LabeledLineStyles,
} from '@/components/map/labeled-line';
import type { RouteStepData } from '@/types/route-step';

export type RouteStepProps = {
    id: string;
    step: RouteStepData;
    label?: ReactNode;
    styles: LabeledLineStyles;
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
            from={coordinates[0]!}
            to={coordinates[coordinates.length - 1]!}
            styles={styles}
            selected={selected}
            label={label}
            onClick={onClick}
        />
    );
};
