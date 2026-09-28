import {
    along,
    bearing,
    bezierSpline,
    destination,
    distance,
    feature,
    length,
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

/**
 * Gets the point at a fraction of a line's length.
 *
 * @param line - The line to walk along.
 * @param fraction - Where to stop, from `0` (its first point) to `1` (its last point). Clamped to that range.
 * @returns The point, as `[longitude, latitude]`.
 */
export const getPointAlong = (line: LineString, fraction: number): Position => {
    // turf.along clamps to 1 and throws on negative numbers
    const clamped = Math.min(Math.max(fraction, 0), 1);
    return along(line, length(feature(line)) * clamped).geometry.coordinates;
};
