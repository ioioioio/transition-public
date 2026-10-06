import type { Api } from 'common';
import { getEnv } from '../utils/env';
import { ApiError, parseUpstreamResponse } from '../utils/http';
import * as Pelias from './schema';

const geocoderEndpoint = getEnv('GEOCODER_ENDPOINT');

const fetchFeatures = async (path: string, params: URLSearchParams) => {
    const response = await fetch(`${geocoderEndpoint}/${path}?${params}`);
    if (!response.ok) {
        throw new ApiError(response.status, await response.json());
    }
    const { features } = parseUpstreamResponse(
        Pelias.FeatureCollectionSchema,
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
