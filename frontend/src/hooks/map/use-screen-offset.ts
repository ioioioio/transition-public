import { useMap } from '@vis.gl/react-maplibre';
import type { Utils } from 'common';
import { useCallback, useSyncExternalStore } from 'react';

// So rounding errors, like when panning, don't count as a change
const roundToTenth = (value: number) => Math.round(value * 10) / 10;

/** With `x` to the right and `y` downwards, as on screen. */
interface ScreenOffset {
    x: number;
    y: number;
}

/**
 * From `from` to `to` on screen, in pixels, or `undefined` when either is missing.
 * Updated as the map zooms, rotates or tilts.
 */
export function useScreenOffset(
    from: Utils.LngLat,
    to: Utils.LngLat,
): ScreenOffset;
export function useScreenOffset(
    from: Utils.LngLat | undefined,
    to: Utils.LngLat | undefined,
): ScreenOffset | undefined;
export function useScreenOffset(
    from: Utils.LngLat | undefined,
    to: Utils.LngLat | undefined,
): ScreenOffset | undefined {
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
        if (!from || !to) {
            return undefined;
        }
        const start = map.project(from);
        const end = map.project(to);
        return `${String(roundToTenth(end.x - start.x))} ${String(roundToTenth(end.y - start.y))}`;
    });
    if (offset === undefined) {
        return undefined;
    }
    const [x = 0, y = 0] = offset.split(' ').map(Number);
    return { x, y };
}
