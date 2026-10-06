import type { Api } from 'common';
import { getEnv } from '../utils/env';

const geocoderEndpoint = getEnv('GEOCODER_ENDPOINT');

export const getAutocomplete = ({ text, focus }: Api.PlaceSearchBody) => {
    const params = new URLSearchParams({ text });
    if (focus) {
        params.set('focus.point.lon', String(focus.lng));
        params.set('focus.point.lat', String(focus.lat));
    }
    return fetch(`${geocoderEndpoint}/autocomplete?${params}`);
};

export const getPlace = (id: string) =>
    fetch(`${geocoderEndpoint}/place?${new URLSearchParams({ ids: id })}`);
