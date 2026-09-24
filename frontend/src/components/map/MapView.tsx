import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import { mapInitialLatitude, mapInitialLongitude, mapInitialZoom } from '../../env';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

const MapView = () => {
    return (
        <Map
            initialViewState={{
                longitude: mapInitialLongitude,
                latitude: mapInitialLatitude,
                zoom: mapInitialZoom,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://demotiles.maplibre.org/style.json"
        />
    );
};

export default MapView;
