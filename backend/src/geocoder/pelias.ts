import type { Api } from 'common';
import { z } from 'zod';
import { getEnv } from '../utils/env';
import { ApiError, parseUpstreamResponse } from '../utils/http';

// Only the fields we use are declared.
// https://github.com/pelias/documentation/blob/master/autocomplete.md
// https://github.com/pelias/documentation/blob/master/place.md

export const FeatureSchema = z.object({
    geometry: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.object({
        gid: z.string(),
        label: z.string(),
    }),
});

export type Feature = z.infer<typeof FeatureSchema>;

export const FeatureCollectionSchema = z.object({
    features: z.array(FeatureSchema),
});

const geocoderEndpoint = getEnv('GEOCODER_ENDPOINT');

const fetchFeatures = async (path: string, params: URLSearchParams) => {
    const response = await fetch(`${geocoderEndpoint}/${path}?${params}`);
    if (!response.ok) {
        throw new ApiError(response.status, await response.json());
    }
    const { features } = parseUpstreamResponse(
        FeatureCollectionSchema,
        await response.json(),
    );
    return features;
};

export const getAutocomplete = ({ text, focus }: Api.PlaceSearchBody) => {
    const params = new URLSearchParams({ text });
    if (focus) {
        params.set('focus.point.lon', String(focus.lng));
        params.set('focus.point.lat', String(focus.lat));
    }
    return fetchFeatures('autocomplete', params);
};

export const getPlace = (id: string) =>
    fetchFeatures('place', new URLSearchParams({ ids: id }));
