import type { Utils } from 'common';

// A position, optionally linked to a search result
export interface PlaceRef {
    id?: string;
    position: Utils.LngLat;
}
