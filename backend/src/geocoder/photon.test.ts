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
import { PhotonGeocoder } from './photon';

const photonUrl = 'http://photon.test';

const position = { lng: 1, lat: 2 };

const createNodeFeature = (properties: Record<string, unknown>) => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [position.lng, position.lat],
        },
        properties: { osm_type: 'N', ...properties },
    };
};

// A feature, and the place it becomes
const feature = createNodeFeature({ osm_id: 3, name: 'Name' });
const place = { id: 'N3@1,2', label: 'Name', position };

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
        http.get(`${photonUrl}/${path}`, (info) => {
            const { searchParams } = new URL(info.request.url);
            endpointSpy(Object.fromEntries(searchParams));
            return HttpResponse.json({ type: 'FeatureCollection', features });
        }),
    );
    return endpointSpy;
};

const geocoder = new PhotonGeocoder(photonUrl);

describe('searchPlaces', () => {
    it('sends the text and the focus', async () => {
        const searchEndpointSpy = setUpFakeEndpoint('api', []);
        await geocoder.searchPlaces({
            text: 'text',
            focus: { lng: 3, lat: 4 },
        });
        expect(searchEndpointSpy).toHaveBeenCalledWith({
            q: 'text',
            lon: '3',
            lat: '4',
        });
    });

    it('sends only the text without a focus', async () => {
        const searchEndpointSpy = setUpFakeEndpoint('api', []);
        await geocoder.searchPlaces({ text: 'text' });
        expect(searchEndpointSpy).toHaveBeenCalledWith({
            q: 'text',
        });
    });

    it('returns the features as places', async () => {
        setUpFakeEndpoint('api', [feature]);
        expect(await geocoder.searchPlaces({ text: 'text' })).toEqual([place]);
    });

    it('labels the name, the address and the city', async () => {
        setUpFakeEndpoint('api', [
            createNodeFeature({
                osm_id: 3,
                name: 'Name',
                housenumber: '10',
                street: 'Street',
                city: 'City',
            }),
        ]);
        const [foundPlace] = await geocoder.searchPlaces({ text: 'text' });
        expect(foundPlace?.label).toBe('Name, 10 Street, City');
    });

    it('labels an address without a name', async () => {
        setUpFakeEndpoint('api', [
            createNodeFeature({
                osm_id: 3,
                housenumber: '10',
                street: 'Street',
                city: 'City',
            }),
        ]);
        const [foundPlace] = await geocoder.searchPlaces({ text: 'text' });
        expect(foundPlace?.label).toBe('10 Street, City');
    });

    // Like the postcodes, which Photon makes up
    it('skips the features without an OSM type and id', async () => {
        const featureWithoutOsmTypeAndId = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [position.lng, position.lat],
            },
            properties: { name: 'Name' },
        };
        setUpFakeEndpoint('api', [featureWithoutOsmTypeAndId, feature]);
        expect(await geocoder.searchPlaces({ text: 'text' })).toEqual([place]);
    });
});

describe('lookUpPlace', () => {
    it('sends the position from the id', async () => {
        const reverseEndpointSpy = setUpFakeEndpoint('reverse', []);
        await geocoder.lookUpPlace(place.id);
        expect(reverseEndpointSpy).toHaveBeenCalledWith({
            lon: '1',
            lat: '2',
            limit: '10',
        });
    });

    it('finds the place with the id among the places around', async () => {
        setUpFakeEndpoint('reverse', [
            createNodeFeature({ osm_id: 4 }),
            feature,
        ]);
        expect(await geocoder.lookUpPlace(place.id)).toEqual(place);
    });

    it('returns null when no place around has the id', async () => {
        setUpFakeEndpoint('reverse', [createNodeFeature({ osm_id: 4 })]);
        expect(await geocoder.lookUpPlace(place.id)).toBe(null);
    });

    it('returns null without searching when the id has no position', async () => {
        const reverseEndpointSpy = setUpFakeEndpoint('reverse', []);
        expect(await geocoder.lookUpPlace('N3')).toBe(null);
        expect(reverseEndpointSpy).not.toHaveBeenCalled();
    });
});

describe('errors', () => {
    it('throws an HttpUpstreamError with the HTTP error', async () => {
        server.use(
            http.get(`${photonUrl}/api`, () => {
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

    it('throws an UpstreamError when Photon is unreachable', async () => {
        server.use(
            http.get(`${photonUrl}/api`, () => {
                return HttpResponse.error();
            }),
        );
        await expect(geocoder.searchPlaces({ text: 'text' })).rejects.toThrow(
            new UpstreamError('Request failed'),
        );
    });

    it('throws an UpstreamError on an unexpected answer', async () => {
        server.use(
            http.get(`${photonUrl}/api`, () => {
                return HttpResponse.json({ results: [] });
            }),
        );
        await expect(geocoder.searchPlaces({ text: 'text' })).rejects.toThrow(
            new UpstreamError('Unexpected answer'),
        );
    });
});
