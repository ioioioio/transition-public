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
    label?: ReactNode;
};

export type RouteStepProps = {
    id: string;
    step: RouteStepData;
    styles: LabeledCurveStyles;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RouteStep = ({
    id,
    step,
    styles,
    selected,
    onLabelClick,
}: RouteStepProps) => {
    const { geometry, mode, label } = step;
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
