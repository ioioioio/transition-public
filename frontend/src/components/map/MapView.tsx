import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

const MapView = () => {
    return (
        <Map
            initialViewState={{
                longitude: -100,
                latitude: 40,
                zoom: 3.5,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://demotiles.maplibre.org/style.json"
        />
    );
};

export default MapView;
