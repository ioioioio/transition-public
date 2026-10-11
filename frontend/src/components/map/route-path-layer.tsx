import type { ReactNode } from 'react';

import {
    RouteStepLayer,
    type RouteStepLayerStyles,
} from '@/components/map/route-step-layer';
import type { RouteStepData } from '@/types/route-step';

export type RoutePathLayerProps = {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: RouteStepData[];
    renderStepLabel?: (step: RouteStepData) => ReactNode;
    // The same for all the steps of the path
    styles: RouteStepLayerStyles;
    selected?: boolean;
    onClick?: () => void;
};

export const RoutePathLayer = ({
    id,
    steps,
    renderStepLabel,
    styles,
    selected,
    onClick,
}: RoutePathLayerProps) => {
    return steps.map((step, index) => (
        <RouteStepLayer
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
