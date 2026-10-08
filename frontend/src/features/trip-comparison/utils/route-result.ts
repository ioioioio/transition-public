import type { Api } from 'common';

import { type Mode } from '@/utils/mode';

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
