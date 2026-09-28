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
};

const RouteLine = ({ id, geometry, bend, dashArray }: RouteLineProps) => {
    const color = getThemeColor('--primary');
    const { coordinates } = geometry;
    const curve = createCurve(coordinates[0], coordinates[coordinates.length - 1], bend);

    return (
        <Source id={id} type="geojson" data={curve}>
            <Layer
                id={`${id}-glow`}
                type="line"
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{ 'line-color': color, 'line-width': 12, 'line-opacity': 0.22 }}
            />
            <Layer
                id={`${id}-line`}
                type="line"
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{ 'line-color': color, 'line-width': 4, ...(dashArray && { 'line-dasharray': dashArray }) }}
            />
        </Source>
    );
};

export default RouteLine;
