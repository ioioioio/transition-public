import { z } from 'zod';
import { getEnv } from '../utils/env';
import { PeliasGeocoder } from './pelias';
import type { Geocoder } from './geocoder';

const GeocoderProviderNameSchema = z.enum(['pelias']);

type GeocoderProviderName = z.infer<typeof GeocoderProviderNameSchema>;

const geocoderClasses = {
    pelias: PeliasGeocoder,
} satisfies Record<GeocoderProviderName, new (endpoint: string) => Geocoder>;

const getGeocoderProviderName = (): GeocoderProviderName => {
    const value = getEnv('GEOCODER_PROVIDER');
    const result = GeocoderProviderNameSchema.safeParse(value);
    if (!result.success) {
        const names = GeocoderProviderNameSchema.options.join(', ');
        throw new Error(
            `Unknown GEOCODER_PROVIDER "${value}", supported: ${names}`,
        );
    }
    return result.data;
};

const createGeocoder = (): Geocoder => {
    const GeocoderClass = geocoderClasses[getGeocoderProviderName()];
    return new GeocoderClass(getEnv('GEOCODER_ENDPOINT'));
};

export const geocoder = createGeocoder();
