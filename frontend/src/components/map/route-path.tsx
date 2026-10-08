import { CarIcon, PersonSimpleWalkIcon } from '@phosphor-icons/react';
import type { LineString } from 'geojson';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LabeledCurve } from '@/components/map/labeled-curve';
import { formatDuration } from '@/utils/format';

export type RoutePathProps = {
    id: string;
    geometry: LineString;
    /** How far the arc bends from the straight line, as a fraction of its length (see `createCurve`). */
    bend: number;
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
    selected?: boolean;
    /** Shown in a pill on the arc. */
    label?: ReactNode;
    /** Where the label sits along the arc, from `0` (start) to `1` (end). */
    labelPosition?: number;
    onLabelClick?: () => void;
};

export const RoutePath = ({
    id,
    geometry,
    bend,
    dashArray,
    selected,
    label,
    labelPosition,
    onLabelClick,
}: RoutePathProps) => {
    const { coordinates } = geometry;

    return (
        <LabeledCurve
            id={id}
            from={coordinates[0]!}
            to={coordinates[coordinates.length - 1]!}
            styles={{ bend, dashArray, labelPosition }}
            selected={selected}
            label={label}
            onLabelClick={onLabelClick}
        />
    );
};

type ModeRoutePathProps = Pick<
    RoutePathProps,
    'geometry' | 'selected' | 'onLabelClick'
> & {
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
            geometry={geometry}
            bend={0.15}
            dashArray={[0.25, 2]}
            selected={selected}
            onLabelClick={onLabelClick}
            label={
                <>
                    <CarIcon />
                    {formatDuration(travelTimeSeconds, i18n.language)}
                </>
            }
            labelPosition={0.36}
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
            geometry={geometry}
            bend={-0.1}
            dashArray={[1.5, 1.5]}
            selected={selected}
            onLabelClick={onLabelClick}
            label={
                <>
                    <PersonSimpleWalkIcon />
                    {formatDuration(travelTimeSeconds, i18n.language)}
                </>
            }
            labelPosition={0.64}
        />
    );
};
