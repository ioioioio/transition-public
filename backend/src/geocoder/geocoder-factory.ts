import type { PrivateConfig } from '../config';
import type { Geocoder } from './geocoder';
import { PeliasGeocoder } from './pelias';

type GeocoderConfig = PrivateConfig['geocoder'];

const geocoderClasses = {
    pelias: PeliasGeocoder,
} satisfies Record<
    GeocoderConfig['provider'],
    new (endpoint: string) => Geocoder
>;

export const createGeocoder = (geocoderConfig: GeocoderConfig): Geocoder => {
    const GeocoderClass = geocoderClasses[geocoderConfig.provider];
    return new GeocoderClass(geocoderConfig.endpoint);
};
