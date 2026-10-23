import { PeliasGeocoder } from './pelias';
import type {
    Geocoder,
    GeocoderConfig,
    GeocoderProviderName,
} from './geocoder';

const geocoderClasses = {
    pelias: PeliasGeocoder,
} satisfies Record<GeocoderProviderName, new (endpoint: string) => Geocoder>;

export const createGeocoder = (geocoderConfig: GeocoderConfig): Geocoder => {
    const GeocoderClass = geocoderClasses[geocoderConfig.provider];
    return new GeocoderClass(geocoderConfig.endpoint);
};
