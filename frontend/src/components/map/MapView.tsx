import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import { mapInitialLatitude, mapInitialLongitude, mapInitialZoom } from '../../env';
import PlaceMarker from './PlaceMarker';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

type MapViewProps = {
    origin: LngLat | null;
    destination: LngLat | null;
    onMapClick: (position: LngLat) => void;
    onOriginMove: (position: LngLat) => void;
    onDestinationMove: (position: LngLat) => void;
};

const MapView = ({ origin, destination, onMapClick, onOriginMove, onDestinationMove }: MapViewProps) => {
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
            {origin && <PlaceMarker label="A" position={origin} onMove={onOriginMove} />}
            {destination && <PlaceMarker label="B" position={destination} onMove={onDestinationMove} />}
        </Map>
    );
};

export default MapView;
