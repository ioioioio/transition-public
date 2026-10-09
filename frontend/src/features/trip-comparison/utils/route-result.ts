import type { Api } from 'common';

import { isMode, type Mode } from '@/utils/mode';

const unimodalRoutingModes = [
    'driving',
    'walking',
] as const satisfies readonly Mode[];

export type UnimodalRoutingMode = (typeof unimodalRoutingModes)[number];

export type RoutingMode = UnimodalRoutingMode | 'transit';

const isUnimodalRoutingMode = (value: string): value is UnimodalRoutingMode =>
    (unimodalRoutingModes as readonly string[]).includes(value);

// The result of a mode other than transit
export type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    Api.RouteResponse['result']['walking']
>;

export const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [UnimodalRoutingMode, UnimodalRouteResult] =>
    isUnimodalRoutingMode(entry[0]) && entry[1] !== undefined;

export type TransitRouteResult = NonNullable<
    Api.RouteResponse['result']['transit']
>;

export const isTransitRouteResultEntry = (
    entry: [string, unknown],
): entry is ['transit', TransitRouteResult] =>
    entry[0] === 'transit' && entry[1] !== undefined;

// Longest first, without walking. Unknown modes become `other`.
export const sortTransitModesByDistance = (
    path: TransitRouteResult['paths'][number],
): Mode[] => {
    const distances = new Map<Mode, number>();
    for (const step of path.steps) {
        if (step.action === 'unboarding') {
            const mode = isMode(step.mode) ? step.mode : 'other';
            distances.set(
                mode,
                (distances.get(mode) ?? 0) + step.inVehicleDistance,
            );
        }
    }
    return [...distances].sort(([, a], [, b]) => b - a).map(([mode]) => mode);
};
