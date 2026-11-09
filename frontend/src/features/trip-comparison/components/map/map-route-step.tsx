import type { Icon } from '@phosphor-icons/react';
import type { Api } from 'common';

import {
    MapLine,
    type MapLineStyles,
    type LineEmphasis,
} from '@/components/map/map-line';
import {
    createRouteStepGeometry,
    getRouteStepMode,
    isTravelRouteStep,
} from '@/features/trip-comparison/utils/route-step';
import { modeColors } from '@/utils/mode';

export interface MapRouteStepStyles {
    line: MapLineStyles;
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
}

export interface MapRouteStepProps {
    id: string;
    step: Api.RouteStep;
    icon: Icon;
    styles: MapRouteStepStyles;
    emphasis: LineEmphasis;
    onClick?: () => void;
    onPress?: () => void;
}

export const MapRouteStep = ({
    id,
    step,
    icon,
    styles,
    emphasis,
    onClick,
    onPress,
}: MapRouteStepProps) => {
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
