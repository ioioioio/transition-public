import { type Api, Utils } from 'common';
import { z } from 'zod';
import {
    fetchUpstream,
    HttpUpstreamError,
    parseUpstreamResponse,
} from '../utils/http';
import type { Geocoder } from './geocoder';

// Photon's answers, with only the fields we use
// https://github.com/komoot/photon#search-and-geocoding-api

const FeatureSchema = z.object({
    geometry: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.object({
        // Only the features we use
        osm_type: z.string().optional(),
        osm_id: z.number().optional(),
        name: z.string().optional(),
        housenumber: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
    }),
});

type Feature = z.infer<typeof FeatureSchema>;

const FeatureCollectionSchema = z.object({
    features: z.array(FeatureSchema),
});

// Photon's reverse returns only the closest place by default, which can be
// another place at the same point, like a shop and the building it's in
const reverseLimit = 10;

const createSearchParams = (body: Api.PlaceSearchBody) => {
    const { text, focus } = body;
    const params = new URLSearchParams({ q: text });
    if (focus) {
        params.set('lon', String(focus.lng));
        params.set('lat', String(focus.lat));
    }
    return params;
};

const createReverseParams = (position: Utils.LngLat) => {
    return new URLSearchParams({
        lon: String(position.lng),
        lat: String(position.lat),
        limit: String(reverseLimit),
    });
};

// Photon has no label, so it's made like Pelias' "name, address, city"
const createLabel = (properties: Feature['properties']) => {
    const { name, housenumber, street, city } = properties;
    const address = [housenumber, street].filter(Boolean).join(' ');
    return [name, address, city].filter(Boolean).join(', ');
};

// Photon can't look up a place by its OSM type and id, so the id also holds
// the position to find it around, e.g. "W115802108@-73.5674277,45.5004189"
const createPlaceId = (
    osmType: string,
    osmId: number,
    position: Utils.LngLat,
) => {
    return `${osmType}${osmId}@${position.lng},${position.lat}`;
};

const placeIdPositionPattern = /@([^,@]+),([^,@]+)$/;

const parsePlaceIdPosition = (id: string): Utils.LngLat | null => {
    const match = placeIdPositionPattern.exec(id);
    if (!match) {
        return null;
    }
    const [, lng, lat] = match;
    const result = Utils.LngLatSchema.safeParse({
        lng: Number(lng),
        lat: Number(lat),
    });
    return result.success ? result.data : null;
};

const createPlace = (feature: Feature): Api.Place | null => {
    const { geometry, properties } = feature;
    if (properties.osm_type === undefined || properties.osm_id === undefined) {
        return null;
    }
    const position = {
        lng: geometry.coordinates[0],
        lat: geometry.coordinates[1],
    };
    return {
        id: createPlaceId(properties.osm_type, properties.osm_id, position),
        label: createLabel(properties),
        position,
    };
};

export class PhotonGeocoder implements Geocoder {
    constructor(private readonly url: string) {}

    async searchPlaces(body: Api.PlaceSearchBody): Promise<Api.Place[]> {
        return this.fetchPlaces('api', createSearchParams(body));
    }

    async lookUpPlace(id: string): Promise<Api.Place | null> {
        const position = parsePlaceIdPosition(id);
        if (!position) {
            return null;
        }
        // Finds the place among the places around the position in its id
        const places = await this.fetchPlaces(
            'reverse',
            createReverseParams(position),
        );
        return places.find((place) => place.id === id) ?? null;
    }

    private async fetchPlaces(path: string, params: URLSearchParams) {
        const response = await fetchUpstream(() =>
            fetch(`${this.url}/${path}?${params}`),
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
        return features.map(createPlace).filter((place) => place !== null);
    }
}
