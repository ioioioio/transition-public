import type { Icon } from '@phosphor-icons/react';
import type { Api } from 'common';

import type { LineEmphasis } from '@/components/map/map-line';
import {
    RouteStepLayer,
    type RouteStepLayerStyles,
} from '@/components/map/route-step-layer';
import { createNestedId } from '@/utils/nested-id';

export interface RoutePathLayerProps {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: Api.RouteStep[];
    getStepIcon: (step: Api.RouteStep) => Icon;
    // The same for all the steps of the path
    styles: RouteStepLayerStyles;
    emphasis: LineEmphasis;
    onClick?: () => void;
    onPress?: () => void;
}

export const RoutePathLayer = ({
    id: pathId,
    steps,
    getStepIcon,
    styles,
    emphasis,
    onClick,
    onPress,
}: RoutePathLayerProps) => {
    return steps.map((step, index) => (
        <RouteStepLayer
            key={index}
            id={createNestedId(pathId, index)}
            step={step}
            icon={getStepIcon(step)}
            styles={styles}
            emphasis={emphasis}
            onClick={onClick}
            onPress={onPress}
        />
    ));
};
