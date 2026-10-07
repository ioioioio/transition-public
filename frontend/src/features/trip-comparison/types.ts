import type { Api } from 'common';

import type { PlaceRef } from '@/types/place';

export const routeModes = ['driving', 'walking'] as const;

export type RouteMode = (typeof routeModes)[number];

// The result of a mode other than transit
export type UnimodalRouteResult = NonNullable<
    // 'walking' is arbitrary. Could have been any other mode other than 'transit'.
    Api.RouteResponse['result']['walking']
>;

export type TripPlaces = {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
};
