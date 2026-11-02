import { useMap } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import { useEffect, useMemo, useState } from 'react';

import { getPointAlong } from '@/utils/geo';

export interface LabeledPath {
    id: string;
    line: LineString;
}

// Where along its path a label may go, from the middle outwards
const fractions = [
    0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15,
    0.85, 0.1, 0.9,
];
// Until a label is drawn and can be measured, in pixels
const estimatedLabelSize = { width: 120, height: 36 };
// Between labels, in pixels
const labelMargin = 4;

interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

const createBox = (
    center: { x: number; y: number },
    element: HTMLElement | undefined,
): Box => {
    const width = element?.offsetWidth ?? estimatedLabelSize.width;
    const height = element?.offsetHeight ?? estimatedLabelSize.height;
    return {
        left: center.x - width / 2 - labelMargin,
        top: center.y - height / 2 - labelMargin,
        right: center.x + width / 2 + labelMargin,
        bottom: center.y + height / 2 + labelMargin,
    };
};

const overlaps = (a: Box, b: Box) =>
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;

// By value, as the spots are worked out again when the paths are
const isSameSpot = (a: Position, b: Position | undefined) =>
    b !== undefined && a.at(0) === b.at(0) && a.at(1) === b.at(1);

const isSamePlacement = (
    a: ReadonlyMap<string, Position>,
    b: ReadonlyMap<string, Position>,
) =>
    a.size === b.size &&
    [...a].every(([id, spot]) => isSameSpot(spot, b.get(id)));

/**
 * Places each path's label along it, where it doesn't overlap the labels placed before it and
 * stays on screen, and places them again as the map moves.
 *
 * @param paths - The labelled paths, highest priority first.
 * @returns Each label's position, and a ref to give each label so it can be measured.
 */
export const useLabelPlacement = (paths: LabeledPath[]) => {
    const { current: map } = useMap();
    const [elements] = useState(() => new Map<string, HTMLElement>());
    const [drawnLabelCount, setDrawnLabelCount] = useState(0);
    const [positions, setPositions] = useState<ReadonlyMap<string, Position>>(
        () => new Map(),
    );
    // Walking a long line is slow, so only once per path
    const spotsByPath = useMemo(
        () =>
            new Map(
                paths.map((path) => [
                    path.id,
                    fractions.map((fraction) =>
                        getPointAlong(path.line, fraction),
                    ),
                ]),
            ),
        [paths],
    );

    useEffect(() => {
        if (!map) {
            return;
        }
        const container = map.getContainer();
        const project = (spot: Position) => {
            const [longitude = 0, latitude = 0] = spot;
            return map.project([longitude, latitude]);
        };
        const isInView = (box: Box) =>
            box.left >= 0 &&
            box.top >= 0 &&
            box.right <= container.clientWidth &&
            box.bottom <= container.clientHeight;

        const place = () => {
            setPositions((previous) => {
                const placedBoxes: Box[] = [];
                const next = new Map<string, Position>();
                for (const [id, spots] of spotsByPath) {
                    const element = elements.get(id);
                    const fits = (spot: Position) => {
                        const box = createBox(project(spot), element);
                        return (
                            isInView(box) &&
                            !placedBoxes.some((other) => overlaps(box, other))
                        );
                    };
                    // Unless the path changed
                    const previousSpot = spots.find((spot) =>
                        isSameSpot(spot, previous.get(id)),
                    );
                    // Stays put while it fits, so labels don't jump around.
                    // When none fits, overlapping beats being off screen.
                    const spot =
                        (previousSpot && fits(previousSpot)
                            ? previousSpot
                            : spots.find(fits)) ??
                        spots.find((candidate) =>
                            isInView(createBox(project(candidate), element)),
                        ) ??
                        previousSpot ??
                        spots.at(0);
                    if (!spot) {
                        continue;
                    }
                    placedBoxes.push(createBox(project(spot), element));
                    next.set(id, spot);
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

    return { positions, registerLabel };
};
