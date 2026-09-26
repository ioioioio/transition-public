import type { Utils } from 'common';

export const toPointFeature = ({ lng, lat }: Utils.LngLat) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [lng, lat] },
});
