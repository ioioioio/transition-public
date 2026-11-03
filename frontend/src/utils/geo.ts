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
    nearestPointOnLine,
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
 * Finds the point of a line closest to a position. A line from the position to it meets the line
 * at a right angle, except at its ends and corners.
 *
 * @param line - The line to search along.
 * @param position - As `[longitude, latitude]`.
 * @returns The closest point, as `[longitude, latitude]`.
 */
export const findNearestPointOnLine = (
    line: LineString,
    position: Position,
): Position => nearestPointOnLine(line, position).geometry.coordinates;

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

/**
 * Gets the points at several fractions of a line's length, walking it only once. Faster than
 * `getPointAlong` for each, on long lines.
 *
 * @param line - The line to walk along.
 * @param fractions - Where to stop, each from `0` (its first point) to `1` (its last point).
 *   Clamped to that range.
 * @returns The points, in the order of `fractions`, as `[longitude, latitude]`.
 */
export const getPointsAlong = (
    line: LineString,
    fractions: number[],
): Position[] => {
    const { coordinates } = line;
    // From the start to each point
    const distances = [0];
    coordinates.forEach((point, index) => {
        const previous = coordinates.at(index - 1);
        if (index === 0 || !previous) {
            return;
        }
        distances.push((distances.at(-1) ?? 0) + distance(previous, point));
    });
    const totalDistance = distances.at(-1) ?? 0;
    return fractions.map((fraction) => {
        const target = totalDistance * Math.min(Math.max(fraction, 0), 1);
        const endIndex = Math.max(
            distances.findIndex((pointDistance) => pointDistance >= target),
            1,
        );
        const start = coordinates.at(endIndex - 1);
        const end = coordinates.at(endIndex);
        if (!start || !end) {
            return coordinates.at(0) ?? [0, 0];
        }
        const startDistance = distances.at(endIndex - 1) ?? 0;
        const segmentDistance = (distances.at(endIndex) ?? 0) - startDistance;
        // Within a segment, the line is short enough to be straight
        const ratio =
            segmentDistance > 0
                ? (target - startDistance) / segmentDistance
                : 0;
        const [startLongitude = 0, startLatitude = 0] = start;
        const [endLongitude = 0, endLatitude = 0] = end;
        return [
            startLongitude + (endLongitude - startLongitude) * ratio,
            startLatitude + (endLatitude - startLatitude) * ratio,
        ];
    });
};
