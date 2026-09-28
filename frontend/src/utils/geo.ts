import {
    bearing,
    bezierSpline,
    destination,
    distance,
    lineString,
    midpoint,
} from '@turf/turf';
import type { LineString, Position } from 'geojson';

/**
 * Draws a smooth arc from `start` to `end`, bent to the right of the direction of travel.
 *
 * @param start - First point of the arc, as `[longitude, latitude]`.
 * @param end - Last point of the arc, as `[longitude, latitude]`.
 * @param bend - How far the middle of the arc sits from the straight line, as a fraction of the
 *   distance between `start` and `end` (e.g. `0.15`). A negative value bends it to the left.
 * @returns The arc.
 */
export const createCurve = (
    start: Position,
    end: Position,
    bend: number,
): LineString => {
    const middle = midpoint(start, end);
    const offset = destination(
        middle,
        distance(start, end) * bend,
        bearing(start, end) + 90,
    );
    return bezierSpline(lineString([start, offset.geometry.coordinates, end]))
        .geometry;
};
