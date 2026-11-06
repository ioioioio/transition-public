import type { Icon } from '@phosphor-icons/react';
import type { Api } from 'common';

import {
    MapLine,
    type MapLineStyles,
    type LineEmphasis,
} from '@/components/map/map-line';
import { modeColors } from '@/utils/mode';
import {
    createRouteStepGeometry,
    getRouteStepMode,
    isTravelRouteStep,
} from '@/utils/route-step';

export interface RouteStepLayerStyles {
    line: MapLineStyles;
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
}

export interface RouteStepLayerProps {
    id: string;
    step: Api.RouteStep;
    icon: Icon;
    styles: RouteStepLayerStyles;
    emphasis: LineEmphasis;
    onClick?: () => void;
    onPress?: () => void;
}

export const RouteStepLayer = ({
    id,
    step,
    icon,
    styles,
    emphasis,
    onClick,
    onPress,
}: RouteStepLayerProps) => {
    // Stops aren't drawn
    if (!isTravelRouteStep(step)) {
        return null;
    }
    const geometry = createRouteStepGeometry(step, styles.bend);

    return (
        <MapLine
            id={id}
            geometry={geometry}
            styles={styles.line}
            color={modeColors[getRouteStepMode(step)]}
            emphasis={emphasis}
            icon={icon}
            onClick={onClick}
            onPress={onPress}
        />
    );
};
