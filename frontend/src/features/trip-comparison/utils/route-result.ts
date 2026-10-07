import type { Api } from 'common';

export const routeModes = ['driving', 'walking'] as const;

export type RouteMode = (typeof routeModes)[number];

// The result of a mode other than transit
export type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    Api.RouteResponse['result']['walking']
>;

const isRouteMode = (mode: string): mode is RouteMode =>
    (routeModes as readonly string[]).includes(mode);

export const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [RouteMode, UnimodalRouteResult] =>
    isRouteMode(entry[0]) && entry[1] !== undefined;
