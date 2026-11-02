import { useMap, type MapRef } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import { useEffect, useMemo, useState } from 'react';

import { findNearestPointOnLine, getPointsAlong } from '@/utils/geo';

export interface LabeledPath {
    id: string;
    line: LineString;
}

export interface LabelOffset {
    x: number;
    y: number;
}

/** The point of the label that `offset` leads to: one of its edges' middle, or its centre. */
export type LabelEdge = 'center' | 'left' | 'right' | 'top' | 'bottom';

export interface LabelPlacement {
    /** Where the label's leader meets its path, as `[longitude, latitude]`. */
    anchor: Position;
    /** From the anchor to the label's `edge`, in pixels. */
    offset: LabelOffset;
    edge: LabelEdge;
}

// Where along its path a label's anchor may go, from the middle outwards
const fractions = [
    0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15,
    0.85, 0.1, 0.9,
];
// Between the path and the label's nearest edge, in pixels, closest first. Long
// enough that the leader shows which line the label belongs to.
const gaps = [24, 48];
// Either side of the path, from its direction of travel
const sides = [1, -1] as const;
// Just ahead of the anchor, to find the path's direction there
const aheadFraction = 0.01;
// Until a label is drawn and can be measured, in pixels
const estimatedLabelSize = { width: 120, height: 36 };
// Between labels, in pixels
const labelMargin = 4;
// Smaller moves, like from rounding, aren't worth a render
const offsetTolerance = 0.5;

interface Spot {
    anchor: Position;
    ahead: Position;
    side: (typeof sides)[number];
    gap: number;
}

interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface Size {
    width: number;
    height: number;
}

// All spots at the closest gap come first, so labels stay near their path
const createSpots = (line: LineString): Spot[] => {
    const points = getPointsAlong(line, [
        ...fractions,
        ...fractions.map((fraction) => fraction + aheadFraction),
    ]);
    const anchors = fractions.map((_, index) => ({
        anchor: points.at(index) ?? [0, 0],
        ahead: points.at(fractions.length + index) ?? [0, 0],
    }));
    return gaps.flatMap((gap) =>
        anchors.flatMap((anchor) =>
            sides.map((side) => ({ ...anchor, side, gap })),
        ),
    );
};

// The label's edge that faces its path, on the side `normal` points to. So it
// grows and shrinks away from its path without moving.
const findFacingEdge = (normal: LabelOffset): LabelEdge => {
    if (Math.abs(normal.x) >= Math.abs(normal.y)) {
        return normal.x > 0 ? 'left' : 'right';
    }
    return normal.y > 0 ? 'top' : 'bottom';
};

const findCenter = (
    point: { x: number; y: number },
    edge: LabelEdge,
    size: Size,
) => {
    switch (edge) {
        case 'center':
            return point;
        case 'left':
            return { x: point.x + size.width / 2, y: point.y };
        case 'right':
            return { x: point.x - size.width / 2, y: point.y };
        case 'top':
            return { x: point.x, y: point.y + size.height / 2 };
        case 'bottom':
            return { x: point.x, y: point.y - size.height / 2 };
        default:
            return edge satisfies never;
    }
};

const createBox = (center: { x: number; y: number }, size: Size): Box => ({
    left: center.x - size.width / 2 - labelMargin,
    top: center.y - size.height / 2 - labelMargin,
    right: center.x + size.width / 2 + labelMargin,
    bottom: center.y + size.height / 2 + labelMargin,
});

const overlaps = (a: Box, b: Box) =>
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;

const project = (map: MapRef, position: Position) => {
    const [longitude = 0, latitude = 0] = position;
    return map.project([longitude, latitude]);
};

const measure = (element: HTMLElement | undefined): Size =>
    element
        ? { width: element.offsetWidth, height: element.offsetHeight }
        : estimatedLabelSize;

// A new trip gives its paths new lines, which unpins their labels
const createLineKey = (line: LineString) =>
    JSON.stringify([
        line.coordinates.length,
        line.coordinates.at(0),
        line.coordinates.at(-1),
    ]);

// On the map rather than the screen, so zooming moves the label with the map,
// like everything else
interface Pin {
    lineKey: string;
    /** As `[longitude, latitude]`. */
    center: Position;
    /** The point of the path closest to `center`, as `[longitude, latitude]`. */
    anchor: Position;
}

interface PlacedLabel {
    // Moved by hand when null
    spotIndex: number | null;
    placement: LabelPlacement;
}

const isSamePlacement = (
    a: ReadonlyMap<string, PlacedLabel>,
    b: ReadonlyMap<string, PlacedLabel>,
) =>
    a.size === b.size &&
    [...a].every(([id, placed]) => {
        const other = b.get(id);
        if (
            other?.spotIndex !== placed.spotIndex ||
            other.placement.edge !== placed.placement.edge
        ) {
            return false;
        }
        return (
            Math.abs(other.placement.offset.x - placed.placement.offset.x) <
                offsetTolerance &&
            Math.abs(other.placement.offset.y - placed.placement.offset.y) <
                offsetTolerance
        );
    });

/**
 * Places each path's label beside it, linked to it by a leader, where it doesn't overlap the
 * labels placed before it and stays on screen. Places them again as the map moves. A label moved
 * by hand stays where it was put on the map, and the others avoid it.
 *
 * @param paths - The labelled paths, highest priority first.
 * @returns Each label's placement, a ref to give each label so it can be measured, and a function
 *   to move a label by hand.
 */
export const useLabelPlacement = (paths: LabeledPath[]) => {
    const { current: map } = useMap();
    const [elements] = useState(() => new Map<string, HTMLElement>());
    // Counts the labels' size changes, to place them again with their sizes,
    // like when one is first drawn or expands
    const [labelSizesVersion, setLabelSizesVersion] = useState(0);
    const [sizeObserver] = useState(
        () =>
            new ResizeObserver(() => {
                setLabelSizesVersion((version) => version + 1);
            }),
    );
    useEffect(
        () => () => {
            sizeObserver.disconnect();
        },
        [sizeObserver],
    );
    const [placedLabels, setPlacedLabels] = useState<
        ReadonlyMap<string, PlacedLabel>
    >(() => new Map());
    const [pins, setPins] = useState<ReadonlyMap<string, Pin>>(() => new Map());
    const linesById = new Map(paths.map((path) => [path.id, path.line]));
    const validPins = useMemo(
        () =>
            new Map(
                paths.flatMap((path) => {
                    const pin = pins.get(path.id);
                    if (pin?.lineKey !== createLineKey(path.line)) {
                        return [];
                    }
                    return [[path.id, pin] as const];
                }),
            ),
        [paths, pins],
    );
    // Walking a long line is slow, so only once per path
    const spotsByPath = useMemo(
        () => new Map(paths.map((path) => [path.id, createSpots(path.line)])),
        [paths],
    );

    useEffect(() => {
        if (!map) {
            return;
        }
        const container = map.getContainer();
        const isInView = (box: Box) =>
            box.left >= 0 &&
            box.top >= 0 &&
            box.right <= container.clientWidth &&
            box.bottom <= container.clientHeight;

        const place = () => {
            setPlacedLabels((previous) => {
                const placedBoxes: Box[] = [];
                const next = new Map<string, PlacedLabel>();
                // Moved by hand, so the others make room for them
                for (const [id, pin] of validPins) {
                    const size = measure(elements.get(id));
                    const anchor = project(map, pin.anchor);
                    const center = project(map, pin.center);
                    const offset = {
                        x: center.x - anchor.x,
                        y: center.y - anchor.y,
                    };
                    placedBoxes.push(
                        createBox(
                            { x: anchor.x + offset.x, y: anchor.y + offset.y },
                            size,
                        ),
                    );
                    next.set(id, {
                        spotIndex: null,
                        // Grows and shrinks around where it was dropped
                        placement: {
                            anchor: pin.anchor,
                            offset,
                            edge: 'center',
                        },
                    });
                }
                for (const [id, spots] of spotsByPath) {
                    if (validPins.has(id)) {
                        continue;
                    }
                    const size = measure(elements.get(id));
                    const placeAt = (spotIndex: number) => {
                        const spot = spots.at(spotIndex);
                        if (!spot) {
                            return null;
                        }
                        const anchor = project(map, spot.anchor);
                        const ahead = project(map, spot.ahead);
                        const length =
                            Math.hypot(
                                ahead.x - anchor.x,
                                ahead.y - anchor.y,
                            ) || 1;
                        // Perpendicular to the path, on the spot's side
                        const normal = {
                            x: (-(ahead.y - anchor.y) / length) * spot.side,
                            y: ((ahead.x - anchor.x) / length) * spot.side,
                        };
                        const offset = {
                            x: normal.x * spot.gap,
                            y: normal.y * spot.gap,
                        };
                        const edge = findFacingEdge(normal);
                        const box = createBox(
                            findCenter(
                                {
                                    x: anchor.x + offset.x,
                                    y: anchor.y + offset.y,
                                },
                                edge,
                                size,
                            ),
                            size,
                        );
                        return {
                            box,
                            placed: {
                                spotIndex,
                                placement: {
                                    anchor: spot.anchor,
                                    offset,
                                    edge,
                                },
                            },
                        };
                    };
                    const fits = (spotIndex: number) => {
                        const candidate = placeAt(spotIndex);
                        return (
                            candidate !== null &&
                            isInView(candidate.box) &&
                            !placedBoxes.some((other) =>
                                overlaps(candidate.box, other),
                            )
                        );
                    };
                    const isOnScreen = (spotIndex: number) => {
                        const candidate = placeAt(spotIndex);
                        return candidate !== null && isInView(candidate.box);
                    };
                    const spotIndexes = spots.map((_, index) => index);
                    const previousIndex =
                        previous.get(id)?.spotIndex ?? undefined;
                    // Stays put while it fits, so labels don't jump around.
                    // When none fits, overlapping beats being off screen.
                    const spotIndex =
                        (previousIndex !== undefined && fits(previousIndex)
                            ? previousIndex
                            : spotIndexes.find(fits)) ??
                        spotIndexes.find(isOnScreen) ??
                        previousIndex ??
                        0;
                    const candidate = placeAt(spotIndex);
                    if (!candidate) {
                        continue;
                    }
                    placedBoxes.push(candidate.box);
                    next.set(id, candidate.placed);
                }
                return isSamePlacement(previous, next) ? previous : next;
            });
        };
        place();
        map.on('move', place);
        return () => {
            map.off('move', place);
        };
    }, [map, spotsByPath, elements, labelSizesVersion, validPins]);

    const registerLabel = (id: string) => (element: HTMLElement | null) => {
        // Called again on every render, so only a new label counts
        const previousElement = elements.get(id);
        if (!element || previousElement === element) {
            return;
        }
        if (previousElement) {
            sizeObserver.unobserve(previousElement);
        }
        elements.set(id, element);
        // Also reports its first size, once it's drawn
        sizeObserver.observe(element);
    };

    const placements = new Map(
        [...placedLabels].map(([id, placed]) => [id, placed.placement]),
    );

    // Its anchor follows, to the point of the path closest to the label. Found
    // once, as it doesn't change with the zoom when both are on the map.
    const moveLabel = (id: string, movement: LabelOffset) => {
        const line = linesById.get(id);
        const placement = placements.get(id);
        if (!map || !line || !placement) {
            return;
        }
        const lineKey = createLineKey(line);
        const size = measure(elements.get(id));
        // From the latest pin, as moves can come faster than the label is
        // placed again
        setPins((previous) => {
            const pin = previous.get(id);
            const anchor = project(map, placement.anchor);
            const previousCenter =
                pin?.lineKey === lineKey
                    ? project(map, pin.center)
                    : findCenter(
                          {
                              x: anchor.x + placement.offset.x,
                              y: anchor.y + placement.offset.y,
                          },
                          placement.edge,
                          size,
                      );
            const { lng, lat } = map.unproject([
                previousCenter.x + movement.x,
                previousCenter.y + movement.y,
            ]);
            const center = [lng, lat];
            return new Map(previous).set(id, {
                lineKey,
                center,
                anchor: findNearestPointOnLine(line, center),
            });
        });
    };

    return { placements, registerLabel, moveLabel };
};
