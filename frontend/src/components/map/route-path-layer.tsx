import type { Api } from 'common';
import type { ReactNode } from 'react';

import {
    RouteStepLayer,
    type RouteStepLayerStyles,
} from '@/components/map/route-step-layer';

export interface RoutePathLayerProps {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: Api.RouteStep[];
    renderStepLabel?: (step: Api.RouteStep) => ReactNode;
    // The same for all the steps of the path
    styles: RouteStepLayerStyles;
    selected?: boolean;
    onClick?: () => void;
}

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
