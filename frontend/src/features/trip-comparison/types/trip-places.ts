import type { PlaceRef } from '@/types/place';

export interface TripPlaces {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
}
