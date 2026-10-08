import type { LineString } from 'geojson';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RouteStep, type RouteStepData } from '@/components/map/route-step';
import { formatDuration } from '@/utils/format';

export type RoutePathProps = {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: RouteStepData[];
    // The same for all the steps of the path
    styles: LabeledCurveStyles;
    label?: ReactNode;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RoutePath = ({
    id,
    steps,
    styles,
    label,
    selected,
    onLabelClick,
}: RoutePathProps) => {
    return steps.map((step, index) => (
        <RouteStep
            key={index}
            id={`${id}-${index}`}
            step={step}
            styles={styles}
            label={label}
            selected={selected}
            onLabelClick={onLabelClick}
        />
    ));
};

type ModeRoutePathProps = {
    geometry: LineString;
    selected?: boolean;
    onLabelClick?: () => void;
    travelTimeSeconds: number;
};

export const DrivingRoutePath = ({
    geometry,
    selected,
    onLabelClick,
    travelTimeSeconds,
}: ModeRoutePathProps) => {
    const { i18n } = useTranslation();

    return (
        <RoutePath
            id="route-driving"
            selected={selected}
            onLabelClick={onLabelClick}
            steps={[{ geometry, mode: 'driving' }]}
            styles={{ bend: 0.15, dashArray: [0.25, 2], labelPosition: 0.36 }}
            label={formatDuration(travelTimeSeconds, i18n.language)}
        />
    );
};

export const WalkingRoutePath = ({
    geometry,
    selected,
    onLabelClick,
    travelTimeSeconds,
}: ModeRoutePathProps) => {
    const { i18n } = useTranslation();

    return (
        <RoutePath
            id="route-walking"
            selected={selected}
            onLabelClick={onLabelClick}
            steps={[{ geometry, mode: 'walking' }]}
            styles={{ bend: -0.1, dashArray: [1.5, 1.5], labelPosition: 0.64 }}
            label={formatDuration(travelTimeSeconds, i18n.language)}
        />
    );
};
