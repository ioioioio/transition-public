import type { LineString } from 'geojson';
import type { ReactNode } from 'react';

import {
    LabeledCurve,
    type LabeledCurveStyles,
} from '@/components/map/labeled-curve';
import { modeIcons, type Mode } from '@/utils/mode';

// A step of a route path: where it goes, and how it's travelled
export type RouteStepData = {
    geometry: LineString;
    mode: Mode;
};

export type RouteStepProps = {
    id: string;
    step: RouteStepData;
    styles: LabeledCurveStyles;
    /** Shown next to the mode's icon, in a pill on the step. */
    label?: ReactNode;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RouteStep = ({
    id,
    step,
    styles,
    label,
    selected,
    onLabelClick,
}: RouteStepProps) => {
    const { geometry, mode } = step;
    const { coordinates } = geometry;
    const ModeIcon = modeIcons[mode];

    return (
        <LabeledCurve
            id={id}
            from={coordinates[0]!}
            to={coordinates[coordinates.length - 1]!}
            styles={styles}
            selected={selected}
            label={
                <>
                    <ModeIcon />
                    {label}
                </>
            }
            onLabelClick={onLabelClick}
        />
    );
};
