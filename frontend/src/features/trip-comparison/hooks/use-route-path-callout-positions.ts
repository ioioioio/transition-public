import { bearing, destination, distance, lengthToDegrees } from '@turf/turf';
import type { Api, Utils } from 'common';
import type { LineString } from 'geojson';
import { useMemo, useState } from 'react';

import type { CalloutPosition } from '@/components/map/map-callout';
import { createRoutePathGeometry } from '@/features/trip-comparison/utils/route-step';
import { useScreenOffset } from '@/hooks/map/use-screen-offset';
import {
    createLngLat,
    findNearestPointOnLine,
    findMiddle,
    getPointAlong,
    isLeftOf,
    scaleDistanceFrom,
} from '@/utils/geo';

export interface RoutePathCalloutPositions {
    /** By route id. */
    positions: ReadonlyMap<string, CalloutPosition>;
    /** When the origin and destination are too close on screen for callouts. */
    isZoomedOutTooFar: boolean;
    /** While a callout is dragged. */
    move: (routeId: string, position: Utils.LngLat) => void;
    /** When a callout is dropped. */
    drop: (routeId: string, position: Utils.LngLat) => void;
}

// Away from the line's ends, where lines meet
const anchorRange = { start: 0.2, end: 0.8 };
// As fractions of the distance between the lines' ends
const leaderLength = 0.1;
const labelGap = 0.1;
// Once the OD pair is closer than this on screen, labels keep their distances
// on screen rather than on the map, as they don't shrink when zoomed out
const minOdPairPixels = 600;
// Below this, the OD pair is too close on screen for its callouts
const minCalloutsOdPairPixels = 150;

type Side = 'left' | 'right';

// Seen going from the line's start to its end, which side of the straight
// line between them it bulges to
const findBulgeSide = (geometry: LineString): Side =>
    isLeftOf(
        getPointAlong(geometry, 0),
        getPointAlong(geometry, 1),
        getPointAlong(geometry, 0.5),
    )
        ? 'left'
        : 'right';

const createAnchor = (
    geometry: LineString,
    indexOnSide: number,
    totalOnSide: number,
) => {
    // The anchor range split in one part per callout on this side
    const partLength = (anchorRange.end - anchorRange.start) / totalOnSide;
    return getPointAlong(
        geometry,
        // In the middle of its part
        anchorRange.start + (indexOnSide + 0.5) * partLength,
    );
};

/**
 * Places a label away from the straight line from `start` to `end`, on `side`.
 */
const createLabel = (
    start: Utils.LngLat,
    end: Utils.LngLat,
    anchor: Utils.LngLat,
    side: Side,
) => {
    const awayBearing =
        bearing([start.lng, start.lat], [end.lng, end.lat]) +
        (side === 'left' ? -90 : 90);
    return createLngLat(
        destination(
            [anchor.lng, anchor.lat],
            distance([start.lng, start.lat], [end.lng, end.lat]) * leaderLength,
            awayBearing,
        ).geometry.coordinates,
    );
};

const raiseCrowdedLabels = (
    callouts: readonly {
        routeId: string;
        side: Side;
        anchor: Utils.LngLat;
        label: Utils.LngLat;
    }[],
    gap: number,
) => {
    // From left to right, raise each label over the one on its left on the same
    // side when they would be at about the same height
    const positions: { routeId: string; position: CalloutPosition }[] = [];
    const leftLabelBySide = new Map<Side, Utils.LngLat>();
    for (const { routeId, side, anchor, label } of callouts.toSorted(
        (a, b) => a.label.lng - b.label.lng,
    )) {
        const leftLabel = leftLabelBySide.get(side);
        const raisedLabel =
            leftLabel && Math.abs(label.lat - leftLabel.lat) < gap
                ? { lng: label.lng, lat: leftLabel.lat + gap }
                : label;
        leftLabelBySide.set(side, raisedLabel);
        positions.push({
            routeId,
            position: { label: raisedLabel, anchor },
        });
    }
    return positions;
};

interface OdPair {
    origin: Utils.LngLat;
    destination: Utils.LngLat;
}

// All route paths have same origin and same destination
const findOdPair = (
    pathGeometryByRouteId: ReadonlyMap<string, LineString>,
): OdPair | undefined => {
    const firstPathGeometry = [...pathGeometryByRouteId.values()].at(0);
    if (!firstPathGeometry) {
        return undefined;
    }
    return {
        origin: getPointAlong(firstPathGeometry, 0),
        destination: getPointAlong(firstPathGeometry, 1),
    };
};

const createDefaultPositions = (
    pathGeometryByRouteId: ReadonlyMap<string, LineString>,
    odPair: OdPair,
) => {
    const { origin, destination } = odPair;
    const pathGeometries = [...pathGeometryByRouteId];
    const bulgeSides = pathGeometries.map(([, pathGeometry]) =>
        findBulgeSide(pathGeometry),
    );
    const anchoredCallouts = pathGeometries.map(
        ([routeId, pathGeometry], index) => {
            const side = bulgeSides.at(index) ?? 'right';
            const indexOnSide = bulgeSides
                .slice(0, index)
                .filter((other) => other === side).length;
            const totalOnSide = bulgeSides.filter(
                (other) => other === side,
            ).length;
            return {
                routeId,
                side,
                anchor: createAnchor(pathGeometry, indexOnSide, totalOnSide),
            };
        },
    );

    const callouts = anchoredCallouts.map(({ routeId, side, anchor }) => ({
        routeId,
        side,
        anchor,
        label: createLabel(origin, destination, anchor, side),
    }));
    const gap = lengthToDegrees(
        distance([origin.lng, origin.lat], [destination.lng, destination.lat]) *
            labelGap,
    );
    return raiseCrowdedLabels(callouts, gap);
};

const useIsZoomedOutTooFar = (odPair: OdPair | undefined) => {
    const odPairOnScreen = useScreenOffset(odPair?.origin, odPair?.destination);
    return odPairOnScreen
        ? Math.hypot(odPairOnScreen.x, odPairOnScreen.y) <
              minCalloutsOdPairPixels
        : false;
};

// How much further apart labels go on the map, from the OD pair's middle, to
// keep their distances on screen
const useLabelSpread = (odPair: OdPair | undefined) => {
    const odPairOnScreen = useScreenOffset(odPair?.origin, odPair?.destination);
    if (!odPairOnScreen) {
        return undefined;
    }
    return Math.max(
        1,
        minOdPairPixels / Math.hypot(odPairOnScreen.x, odPairOnScreen.y),
    );
};

const scaleDistanceFromMiddle = (
    odPair: OdPair,
    point: Utils.LngLat,
    factor: number,
) =>
    scaleDistanceFrom(
        findMiddle(odPair.origin, odPair.destination),
        point,
        factor,
    );

const spreadPositions = (
    defaultPositions: readonly { routeId: string; position: CalloutPosition }[],
    movedPositions: ReadonlyMap<string, Partial<CalloutPosition>>,
    odPair: OdPair,
    labelSpread: number,
) => {
    return new Map<string, CalloutPosition>(
        defaultPositions.map(({ routeId, position }) => {
            const moved = movedPositions.get(routeId);
            return [
                routeId,
                {
                    label: scaleDistanceFromMiddle(
                        odPair,
                        moved?.label ?? position.label,
                        labelSpread,
                    ),
                    anchor: moved?.anchor ?? position.anchor,
                },
            ];
        }),
    );
};

/**
 * Where each route path's callout goes: by default, spread out so the callouts are unlikely to
 * overlap; once dragged, where it was dragged to.
 */
export const useRoutePathCalloutPositions = (
    paths: readonly { route: Api.Route; bend: number }[],
): RoutePathCalloutPositions => {
    // memo: "Heavy" computation
    const pathGeometryByRouteId = useMemo(
        () =>
            new Map(
                paths.map(({ route, bend }) => [
                    route.id,
                    createRoutePathGeometry(route.steps, bend),
                ]),
            ),
        [paths],
    );

    const odPair = useMemo(
        () => findOdPair(pathGeometryByRouteId),
        [pathGeometryByRouteId],
    );
    const defaultPositions = useMemo(
        () =>
            odPair ? createDefaultPositions(pathGeometryByRouteId, odPair) : [],
        [pathGeometryByRouteId, odPair],
    );

    const labelSpread = useLabelSpread(odPair);

    const [movedPositions, setMovedPositions] = useState<
        ReadonlyMap<string, Partial<CalloutPosition>>
    >(() => new Map());
    const positions = useMemo(() => {
        // No route paths
        if (!odPair || !labelSpread) {
            return new Map<string, CalloutPosition>();
        }
        return spreadPositions(
            defaultPositions,
            movedPositions,
            odPair,
            labelSpread,
        );
    }, [defaultPositions, movedPositions, odPair, labelSpread]);

    const move = (routeId: string, position: Utils.LngLat) => {
        if (!odPair || !labelSpread) {
            return;
        }
        // Unspread, as it's spread when shown
        const label = scaleDistanceFromMiddle(
            odPair,
            position,
            1 / labelSpread,
        );
        setMovedPositions((previous) =>
            new Map(previous).set(routeId, { ...previous.get(routeId), label }),
        );
    };
    const drop = (routeId: string, position: Utils.LngLat) => {
        const pathGeometry = pathGeometryByRouteId.get(routeId);
        if (!pathGeometry) {
            return;
        }
        const anchor = findNearestPointOnLine(pathGeometry, position);
        setMovedPositions((previous) =>
            new Map(previous).set(routeId, {
                ...previous.get(routeId),
                anchor,
            }),
        );
    };

    const isZoomedOutTooFar = useIsZoomedOutTooFar(odPair);

    return { positions, isZoomedOutTooFar, move, drop };
};
