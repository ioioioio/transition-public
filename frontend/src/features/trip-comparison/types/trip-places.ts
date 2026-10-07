import type { PlaceRef } from '@/types/place';

export type TripPlaces = {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
};
