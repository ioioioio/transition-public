import { Layer, Source } from '@vis.gl/react-maplibre';
import type { LineString } from 'geojson';
import { createCurve } from '../../utils/geo';
import { getThemeColor } from '../../utils/color';

export type RouteLineProps = {
    id: string;
    geometry: LineString;
    /** How far the arc bends from the straight line, as a fraction of its length (see `createCurve`). */
    bend: number;
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
    selected?: boolean;
};

export const RouteLine = ({ id, geometry, bend, dashArray, selected = false }: RouteLineProps) => {
    const color = getThemeColor(selected ? '--primary' : '--foreground');
    const { coordinates } = geometry;
    const curve = createCurve(coordinates[0], coordinates[coordinates.length - 1], bend);

    return (
        <Source id={id} type="geojson" data={curve}>
            {selected && (
                <Layer
                    id={`${id}-glow`}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{ 'line-color': color, 'line-width': 12, 'line-opacity': 0.22 }}
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
    );
};

type ModeRouteLineProps = Pick<RouteLineProps, 'geometry' | 'selected'>;

export const DrivingRouteLine = ({ geometry, selected }: ModeRouteLineProps) => {
    return <RouteLine id="route-driving" geometry={geometry} bend={0.15} dashArray={[0.25, 2]} selected={selected} />;
};

export const WalkingRouteLine = ({ geometry, selected }: ModeRouteLineProps) => {
    return <RouteLine id="route-walking" geometry={geometry} bend={-0.1} dashArray={[1.5, 1.5]} selected={selected} />;
};
