import type { Utils } from 'common';

export type RouteMode = 'driving' | 'walking';

export type TripPlaces = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
};
