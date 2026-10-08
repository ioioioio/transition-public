import type { Api } from 'common';

import { isMode, type Mode } from '@/utils/mode';

// The result of a mode other than transit
export type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    Api.RouteResponse['result']['walking']
>;

export const isUnimodalRouteResultEntry = (
    entry: [string, unknown],
): entry is [Mode, UnimodalRouteResult] =>
    isMode(entry[0]) && entry[1] !== undefined;
