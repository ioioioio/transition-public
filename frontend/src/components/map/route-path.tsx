import type { ReactNode } from 'react';

import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RouteStep } from '@/components/map/route-step';
import type { RouteStepData } from '@/types/route-step';

export type RoutePathProps = {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: RouteStepData[];
    renderStepLabel?: (step: RouteStepData) => ReactNode;
    // The same for all the steps of the path
    styles: LabeledCurveStyles;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RoutePath = ({
    id,
    steps,
    renderStepLabel,
    styles,
    selected,
    onLabelClick,
}: RoutePathProps) => {
    return steps.map((step, index) => (
        <RouteStep
            key={index}
            id={`${id}-${index}`}
            step={step}
            label={renderStepLabel?.(step)}
            styles={styles}
            selected={selected}
            onLabelClick={onLabelClick}
        />
    ));
};
