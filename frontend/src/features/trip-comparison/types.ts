import type { PlaceRef } from '@/types/place';

export type RouteMode = 'driving' | 'walking';

export type TripPlaces = {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
};
