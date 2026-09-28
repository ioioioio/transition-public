import type { LngLat } from 'maplibre-gl';
import { useState } from 'react';

const useTripPlaces = () => {
    const [origin, setOrigin] = useState<LngLat | null>(null);
    const [destination, setDestination] = useState<LngLat | null>(null);

    const placeAt = (position: LngLat) => {
        if (origin === null) {
            setOrigin(position);
        } else {
            setDestination(position);
        }
    };

    return { origin, destination, setOrigin, setDestination, placeAt };
};

export default useTripPlaces;
