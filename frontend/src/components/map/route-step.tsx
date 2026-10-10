import type { LineString } from 'geojson';
import type { ReactNode } from 'react';

import {
    LabeledCurve,
    type LabeledCurveStyles,
} from '@/components/map/labeled-curve';

// A step of a route path: where it goes, and what's shown on it
export type RouteStepData = {
    geometry: LineString;
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
    const { geometry, label } = step;
    const { coordinates } = geometry;

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
