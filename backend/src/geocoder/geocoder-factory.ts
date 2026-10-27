import type { PrivateConfig } from '../config';
import type { Geocoder } from './geocoder';
import { PeliasGeocoder } from './pelias';
import { PhotonGeocoder } from './photon';

type GeocoderConfig = PrivateConfig['geocoder'];

const geocoderClasses = {
    pelias: PeliasGeocoder,
    photon: PhotonGeocoder,
} satisfies Record<GeocoderConfig['provider'], new (url: string) => Geocoder>;

export const createGeocoder = (geocoderConfig: GeocoderConfig): Geocoder => {
    const GeocoderClass = geocoderClasses[geocoderConfig.provider];
    return new GeocoderClass(geocoderConfig.url);
};
