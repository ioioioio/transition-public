import type { Api } from 'common';

export type Geocoder = {
    searchPlaces: (body: Api.PlaceSearchBody) => Promise<Api.Place[]>;
    lookUpPlace: (id: string) => Promise<Api.Place | null>;
};
