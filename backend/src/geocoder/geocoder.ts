import type { Api } from 'common';

export interface Geocoder {
    searchPlaces: (body: Api.PlaceSearchBody) => Promise<Api.Place[]>;
    lookUpPlace: (id: string) => Promise<Api.Place | null>;
}
