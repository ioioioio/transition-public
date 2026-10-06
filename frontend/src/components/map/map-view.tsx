import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Utils } from 'common';
import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { ReactNode } from 'react';

import { mapStyleDark, mapStyleLight } from '@/config/env';
import { useTheme } from '@/hooks/use-theme';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

export type MapViewState = Utils.LngLat & { zoom: number };

type MapViewProps = {
    mapView: MapViewState;
    onViewChange?: (view: MapViewState) => void;
    onMapClick: (position: LngLat) => void;
    children?: ReactNode;
};

const MapView = ({
    mapView,
    onViewChange,
    onMapClick,
    children,
}: MapViewProps) => {
    const { theme } = useTheme();
    return (
        <Map
            initialViewState={{
                longitude: mapView.lng,
                latitude: mapView.lat,
                zoom: mapView.zoom,
            }}
            style={{ width: '100%', height: '100%' }}
            // Attribution should always be visible so people don't forget to turn it on for screenshots
            attributionControl={{ compact: false }}
            mapStyle={theme === 'light' ? mapStyleLight : mapStyleDark}
            onClick={(event) => onMapClick(event.lngLat)}
            onMoveEnd={({ viewState }) =>
                onViewChange?.({
                    lng: viewState.longitude,
                    lat: viewState.latitude,
                    zoom: viewState.zoom,
                })
            }
        >
            {children}
        </Map>
    );
};

export default MapView;
