import type { Api } from 'common';
import { z } from 'zod';
import {
    fetchUpstream,
    HttpUpstreamError,
    parseUpstreamResponse,
} from '../utils/http';
import type { Geocoder } from './geocoder';

// Pelias' answers, with only the fields we use
// https://github.com/pelias/documentation/blob/master/autocomplete.md
// https://github.com/pelias/documentation/blob/master/place.md

const FeatureSchema = z.object({
    geometry: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.object({
        gid: z.string(),
        label: z.string(),
    }),
});

type Feature = z.infer<typeof FeatureSchema>;

const FeatureCollectionSchema = z.object({
    features: z.array(FeatureSchema),
});

const createAutocompleteParams = ({ text, focus }: Api.PlaceSearchBody) => {
    const params = new URLSearchParams({ text });
    if (focus) {
        params.set('focus.point.lon', String(focus.lng));
        params.set('focus.point.lat', String(focus.lat));
    }
    return params;
};

const createPlace = (feature: Feature): Api.Place => {
    const { geometry, properties } = feature;
    return {
        id: properties.gid,
        label: properties.label,
        position: {
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
        },
    };
};

export class PeliasGeocoder implements Geocoder {
    constructor(private readonly url: string) {}

    async searchPlaces(body: Api.PlaceSearchBody): Promise<Api.Place[]> {
        const features = await this.fetchFeatures(
            'autocomplete',
            createAutocompleteParams(body),
        );
        return features.map(createPlace);
    }

    async lookUpPlace(id: string): Promise<Api.Place | null> {
        const [feature] = await this.fetchFeatures(
            'place',
            new URLSearchParams({ ids: id }),
        );
        if (!feature) {
            return null;
        }
        return createPlace(feature);
    }

    private async fetchFeatures(path: string, params: URLSearchParams) {
        const response = await fetchUpstream(() =>
            fetch(`${this.url}/${path}?${params.toString()}`),
        );
        if (!response.ok) {
            throw new HttpUpstreamError({
                status: response.status,
                data: await response.text(),
            });
        }
        const { features } = parseUpstreamResponse(
            FeatureCollectionSchema,
            await response.json(),
        );
        return features;
    }
}
