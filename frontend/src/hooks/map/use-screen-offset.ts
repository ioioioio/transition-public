import { useMap } from '@vis.gl/react-maplibre';
import type { Utils } from 'common';
import { useCallback, useSyncExternalStore } from 'react';

// So rounding errors, like when panning, don't count as a change
const roundToTenth = (value: number) => Math.round(value * 10) / 10;

/**
 * From `from` to `to` on screen, in pixels.
 * Updated as the map zooms, rotates or tilts.
 * @returns `{ x, y }`, with `x` to the right and `y` downwards, as on screen.
 */
export const useScreenOffset = (
    from: Utils.LngLat,
    to: Utils.LngLat,
): { x: number; y: number } => {
    const { current: mapRef } = useMap();
    if (!mapRef) {
        throw new Error('useScreenOffset must be used within a Map');
    }
    const map = mapRef.getMap();
    const subscribe = useCallback(
        (onChange: () => void) => {
            map.on('move', onChange);
            return () => {
                map.off('move', onChange);
            };
        },
        [map],
    );
    // As text, so an unchanged offset is equal and doesn't redraw
    const offset = useSyncExternalStore(subscribe, () => {
        const start = map.project(from);
        const end = map.project(to);
        return `${String(roundToTenth(end.x - start.x))} ${String(roundToTenth(end.y - start.y))}`;
    });
    const [x = 0, y = 0] = offset.split(' ').map(Number);
    return { x, y };
};
