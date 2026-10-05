import type { Utils } from 'common';

export const createPointFeature = ({ lng, lat }: Utils.LngLat) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [lng, lat] },
});
