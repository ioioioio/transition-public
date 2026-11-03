import { useMap, type MapRef } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import { useEffect, useMemo, useState } from 'react';

import { getPointsAlong } from '@/utils/geo';

export interface LabeledPath {
    id: string;
    line: LineString;
}

export interface LabelOffset {
    x: number;
    y: number;
}

export interface LabelPlacement {
    /** Where the label's leader meets its path, as `[longitude, latitude]`. */
    anchor: Position;
    /** From the anchor to the label's centre, in pixels. */
    offset: LabelOffset;
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

// From the anchor to the label's centre, so its nearest edge, not its centre,
// is at the gap
const calculateLeaderLength = (
    direction: LabelOffset,
    gap: number,
    size: Size,
) =>
    gap +
    (Math.abs(direction.x) * size.width) / 2 +
    (Math.abs(direction.y) * size.height) / 2;

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

interface PlacedLabel {
    spotIndex: number;
    placement: LabelPlacement;
}

const isSamePlacement = (
    a: ReadonlyMap<string, PlacedLabel>,
    b: ReadonlyMap<string, PlacedLabel>,
) =>
    a.size === b.size &&
    [...a].every(([id, placed]) => {
        const other = b.get(id);
        if (other?.spotIndex !== placed.spotIndex) {
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
 * labels placed before it and stays on screen. Places them again as the map moves.
 *
 * @param paths - The labelled paths, highest priority first.
 * @returns Each label's placement, and a ref to give each label so it can be measured.
 */
export const useLabelPlacement = (paths: LabeledPath[]) => {
    const { current: map } = useMap();
    const [elements] = useState(() => new Map<string, HTMLElement>());
    const [drawnLabelCount, setDrawnLabelCount] = useState(0);
    const [placedLabels, setPlacedLabels] = useState<
        ReadonlyMap<string, PlacedLabel>
    >(() => new Map());
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
                for (const [id, spots] of spotsByPath) {
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
                        const distance = calculateLeaderLength(
                            normal,
                            spot.gap,
                            size,
                        );
                        const offset = {
                            x: normal.x * distance,
                            y: normal.y * distance,
                        };
                        const box = createBox(
                            { x: anchor.x + offset.x, y: anchor.y + offset.y },
                            size,
                        );
                        return {
                            box,
                            placed: {
                                spotIndex,
                                placement: { anchor: spot.anchor, offset },
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
                    const previousIndex = previous.get(id)?.spotIndex;
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
    }, [map, spotsByPath, elements, drawnLabelCount]);

    const registerLabel = (id: string) => (element: HTMLElement | null) => {
        // Called again on every render, so only a new label counts
        if (!element || elements.get(id) === element) {
            return;
        }
        elements.set(id, element);
        // Placed again with its real size
        setDrawnLabelCount((count) => count + 1);
    };

    const placements = new Map(
        [...placedLabels].map(([id, placed]) => [id, placed.placement]),
    );

    return { placements, registerLabel };
};
