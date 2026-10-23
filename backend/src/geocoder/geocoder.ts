import type { Api } from 'common';
import { z } from 'zod';

export type Geocoder = {
    searchPlaces: (body: Api.PlaceSearchBody) => Promise<Api.Place[]>;
    lookUpPlace: (id: string) => Promise<Api.Place | null>;
};

export const GeocoderProviderNameSchema = z.enum(['pelias']);

export type GeocoderProviderName = z.infer<typeof GeocoderProviderNameSchema>;

export type GeocoderConfig = {
    provider: GeocoderProviderName;
    endpoint: string;
};
