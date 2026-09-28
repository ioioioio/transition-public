import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { ReactNode } from 'react';

import { mapInitialLatitude, mapInitialLongitude, mapInitialZoom } from '../../config/env';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

type MapViewProps = {
    onMapClick: (position: LngLat) => void;
    children?: ReactNode;
};

const MapView = ({ onMapClick, children }: MapViewProps) => {
    return (
        <Map
            initialViewState={{
                longitude: mapInitialLongitude,
                latitude: mapInitialLatitude,
                zoom: mapInitialZoom,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://tiles.openfreemap.org/styles/dark"
            onClick={(event) => onMapClick(event.lngLat)}
        >
            {children}
        </Map>
    );
};

export default MapView;
