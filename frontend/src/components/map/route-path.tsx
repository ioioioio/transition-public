import type { ReactNode } from 'react';

import type { LabeledLineStyles } from '@/components/map/labeled-line';
import { RouteStep } from '@/components/map/route-step';
import type { RouteStepData } from '@/types/route-step';

export type RoutePathProps = {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: RouteStepData[];
    renderStepLabel?: (step: RouteStepData) => ReactNode;
    // The same for all the steps of the path
    styles: LabeledLineStyles;
    selected?: boolean;
    onClick?: () => void;
};

export const RoutePath = ({
    id,
    steps,
    renderStepLabel,
    styles,
    selected,
    onClick,
}: RoutePathProps) => {
    return steps.map((step, index) => (
        <RouteStep
            key={index}
            id={`${id}-${index}`}
            step={step}
            label={renderStepLabel?.(step)}
            styles={styles}
            selected={selected}
            onClick={onClick}
        />
    ));
};
