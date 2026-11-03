import { createContext, useContext } from 'react';

import type { MapImageData } from '@/components/map/map-icon-image';

// What draws each image, by image id
export type MapImageCreators = Map<string, () => MapImageData>;

export const createMapImageCreators = (): MapImageCreators => new Map();

export const MapImageCreatorsContext = createContext<MapImageCreators | null>(
    null,
);

export const useMapImageCreators = () => {
    const creators = useContext(MapImageCreatorsContext);
    if (!creators) {
        throw new Error(
            'useMapImageCreators must be used within a MapImageCreatorsContext',
        );
    }
    return creators;
};
