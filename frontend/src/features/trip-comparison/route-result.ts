import {
    routeModes,
    type RouteMode,
    type UnimodalRouteResult,
} from '@/features/trip-comparison/types';

const isRouteMode = (mode: string): mode is RouteMode =>
    (routeModes as readonly string[]).includes(mode);

export const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [RouteMode, UnimodalRouteResult] =>
    isRouteMode(entry[0]) && entry[1] !== undefined;
