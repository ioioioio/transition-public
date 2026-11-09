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
import type { Utils } from 'common';
import type { LineString } from 'geojson';

/** From GeoJSON coordinates, as `[longitude, latitude]`. */
export const createLngLat = (coordinates: number[]): Utils.LngLat => {
    const [lng = 0, lat = 0] = coordinates;
    return { lng, lat };
};

/**
 * Draws a smooth arc from `start` to `end`, bent to the right of the direction of travel.
 *
 * @param start - First point of the arc.
 * @param end - Last point of the arc.
 * @param bend - How far the middle of the arc sits from the straight line, as a fraction of the
 *   distance between `start` and `end` (e.g. `0.15`). A negative value bends it to the left.
 * @returns The arc.
 */
export const createCurve = (
    start: Utils.LngLat,
    end: Utils.LngLat,
    bend: number,
): LineString => {
    const startCoordinates = [start.lng, start.lat];
    const endCoordinates = [end.lng, end.lat];
    const middle = midpoint(startCoordinates, endCoordinates);
    const offset = destination(
        middle,
        distance(startCoordinates, endCoordinates) * bend,
        bearing(startCoordinates, endCoordinates) + 90,
    );
    return bezierSpline(
        lineString([
            startCoordinates,
            offset.geometry.coordinates,
            endCoordinates,
        ]),
    ).geometry;
};

/**
 * Finds the point of a line closest to a position.
 *
 * @param line - The line to search along.
 * @param position - The position to search from.
 * @returns The closest point.
 */
export const findNearestPointOnLine = (
    line: LineString,
    position: Utils.LngLat,
): Utils.LngLat =>
    createLngLat(
        nearestPointOnLine(line, [position.lng, position.lat]).geometry
            .coordinates,
    );

/**
 * Gets the point at a fraction of a line's length.
 *
 * @param line - The line to walk along.
 * @param fraction - Where to stop, from `0` (its first point) to `1` (its last point). Clamped to that range.
 * @returns The point.
 */
export const getPointAlong = (
    line: LineString,
    fraction: number,
): Utils.LngLat => {
    // turf.along clamps to 1 and throws on negative numbers
    const clamped = Math.min(Math.max(fraction, 0), 1);
    return createLngLat(
        along(line, length(feature(line)) * clamped).geometry.coordinates,
    );
};
