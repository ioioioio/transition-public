import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { HttpUpstreamError, UpstreamError } from '../utils/http';
import { PeliasGeocoder } from './pelias';

const peliasUrl = 'http://pelias.test/v1';

const place = {
    id: 'place-id',
    label: 'Place label',
    position: { lng: 1, lat: 2 },
};

const feature = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [place.position.lng, place.position.lat],
    },
    properties: {
        gid: place.id,
        label: place.label,
    },
};

const server = setupServer();

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

// Answers the requests to a path with the features, and returns a spy called
// with the search params of each request
const setUpFakeEndpoint = (path: string, features: unknown[]) => {
    const endpointSpy = vi.fn<(searchParams: Record<string, string>) => void>();
    server.use(
        http.get(`${peliasUrl}/${path}`, (info) => {
            const { searchParams } = new URL(info.request.url);
            endpointSpy(Object.fromEntries(searchParams));
            return HttpResponse.json({ type: 'FeatureCollection', features });
        }),
    );
    return endpointSpy;
};

const geocoder = new PeliasGeocoder(peliasUrl);

describe('searchPlaces', () => {
    it('sends the text and the focus', async () => {
        const autocompleteEndpointSpy = setUpFakeEndpoint('autocomplete', []);
        await geocoder.searchPlaces({
            text: 'text',
            focus: { lng: 3, lat: 4 },
        });
        expect(autocompleteEndpointSpy).toHaveBeenCalledWith({
            text: 'text',
            'focus.point.lon': '3',
            'focus.point.lat': '4',
        });
    });

    it('sends only the text without a focus', async () => {
        const autocompleteEndpointSpy = setUpFakeEndpoint('autocomplete', []);
        await geocoder.searchPlaces({ text: 'text' });
        expect(autocompleteEndpointSpy).toHaveBeenCalledWith({
            text: 'text',
        });
    });

    it('returns the features as places', async () => {
        setUpFakeEndpoint('autocomplete', [feature]);
        expect(await geocoder.searchPlaces({ text: 'text' })).toEqual([place]);
    });
});

describe('lookUpPlace', () => {
    it('sends the id', async () => {
        const placeEndpointSpy = setUpFakeEndpoint('place', []);
        await geocoder.lookUpPlace(place.id);
        expect(placeEndpointSpy).toHaveBeenCalledWith({
            ids: place.id,
        });
    });

    it('returns the feature as a place', async () => {
        setUpFakeEndpoint('place', [feature]);
        expect(await geocoder.lookUpPlace(place.id)).toEqual(place);
    });

    it('returns null when no place has the id', async () => {
        setUpFakeEndpoint('place', []);
        expect(await geocoder.lookUpPlace(place.id)).toBe(null);
    });
});

describe('errors', () => {
    it('throws an HttpUpstreamError with the HTTP error', async () => {
        server.use(
            http.get(`${peliasUrl}/autocomplete`, () => {
                return new HttpResponse('Bad request', { status: 400 });
            }),
        );
        const search = geocoder.searchPlaces({ text: 'text' });
        await expect(search).rejects.toBeInstanceOf(HttpUpstreamError);
        await expect(search).rejects.toMatchObject({
            status: 400,
            data: 'Bad request',
        });
    });

    it('throws an UpstreamError when Pelias is unreachable', async () => {
        server.use(
            http.get(`${peliasUrl}/autocomplete`, () => {
                return HttpResponse.error();
            }),
        );
        await expect(geocoder.searchPlaces({ text: 'text' })).rejects.toThrow(
            new UpstreamError('Request failed'),
        );
    });

    it('throws an UpstreamError on an unexpected answer', async () => {
        server.use(
            http.get(`${peliasUrl}/autocomplete`, () => {
                return HttpResponse.json({ results: [] });
            }),
        );
        await expect(geocoder.searchPlaces({ text: 'text' })).rejects.toThrow(
            new UpstreamError('Unexpected answer'),
        );
    });
});
