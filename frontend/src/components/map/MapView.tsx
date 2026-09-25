import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useState } from 'react';

import { mapInitialLatitude, mapInitialLongitude, mapInitialZoom } from '../../env';
import PlaceMarker from './PlaceMarker';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

const MapView = () => {
    const [origin, setOrigin] = useState<LngLat | null>(null);
    const [destination, setDestination] = useState<LngLat | null>(null);

    const placePin = (lngLat: LngLat) => {
        if (origin === null) {
            setOrigin(lngLat);
        } else {
            setDestination(lngLat);
        }
    };

    return (
        <Map
            initialViewState={{
                longitude: mapInitialLongitude,
                latitude: mapInitialLatitude,
                zoom: mapInitialZoom,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://tiles.openfreemap.org/styles/dark"
            onClick={(event) => placePin(event.lngLat)}
        >
            {origin && <PlaceMarker label="A" position={origin} onMove={setOrigin} />}
            {destination && <PlaceMarker label="B" position={destination} onMove={setDestination} />}
        </Map>
    );
};

export default MapView;
