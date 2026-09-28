import { CarIcon, PersonSimpleWalkIcon } from '@phosphor-icons/react';
import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { getThemeColor } from '../../utils/color';
import { formatDuration } from '../../utils/format';
import { createCurve, getPointAlong } from '../../utils/geo';

export type RouteLineProps = {
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
};

export const RouteLine = ({
    id,
    geometry,
    bend,
    dashArray,
    selected = false,
    label,
    labelPosition = 0.5,
}: RouteLineProps) => {
    const color = getThemeColor(selected ? '--primary' : '--foreground');
    const { coordinates } = geometry;
    const curve = createCurve(
        coordinates[0],
        coordinates[coordinates.length - 1],
        bend,
    );

    return (
        <>
            <Source id={id} type="geojson" data={curve}>
                {selected && (
                    <Layer
                        id={`${id}-glow`}
                        type="line"
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        paint={{
                            'line-color': color,
                            'line-width': 12,
                            'line-opacity': 0.22,
                        }}
                    />
                )}
                <Layer
                    id={`${id}-line`}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                        'line-color': color,
                        'line-width': selected ? 4 : 2.5,
                        'line-opacity': selected ? 1 : 0.5,
                        ...(dashArray && { 'line-dasharray': dashArray }),
                    }}
                />
            </Source>
            {label && (
                <RouteLabel
                    position={getPointAlong(curve, labelPosition)}
                    selected={selected}
                >
                    {label}
                </RouteLabel>
            )}
        </>
    );
};

type RouteLabelProps = {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    children: ReactNode;
};

const RouteLabel = ({ position, selected, children }: RouteLabelProps) => {
    const [longitude, latitude] = position;

    return (
        <Marker
            longitude={longitude}
            latitude={latitude}
            // Keep clicks on the pill from placing a point on the map.
            onClick={(event) => event.originalEvent.stopPropagation()}
        >
            <div
                className={cn(
                    'flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap tabular-nums shadow-[0_4px_14px_rgba(0,0,0,0.45)] [&_svg]:size-3.5',
                    selected
                        ? 'border-primary text-primary'
                        : 'border-foreground/20 text-foreground/80',
                )}
            >
                {children}
            </div>
        </Marker>
    );
};

type ModeRouteLineProps = Pick<RouteLineProps, 'geometry' | 'selected'> & {
    travelTimeSeconds: number;
};

export const DrivingRouteLine = ({
    geometry,
    selected,
    travelTimeSeconds,
}: ModeRouteLineProps) => {
    return (
        <RouteLine
            id="route-driving"
            geometry={geometry}
            bend={0.15}
            dashArray={[0.25, 2]}
            selected={selected}
            label={
                <>
                    <CarIcon />
                    {formatDuration(travelTimeSeconds, 'fr-CA')}
                </>
            }
            labelPosition={0.36}
        />
    );
};

export const WalkingRouteLine = ({
    geometry,
    selected,
    travelTimeSeconds,
}: ModeRouteLineProps) => {
    return (
        <RouteLine
            id="route-walking"
            geometry={geometry}
            bend={-0.1}
            dashArray={[1.5, 1.5]}
            selected={selected}
            label={
                <>
                    <PersonSimpleWalkIcon />
                    {formatDuration(travelTimeSeconds, 'fr-CA')}
                </>
            }
            labelPosition={0.64}
        />
    );
};
