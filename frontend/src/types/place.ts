import type { Utils } from 'common';

// A position, optionally linked to a search result
export type PlaceRef = {
    id?: string;
    position: Utils.LngLat;
};
