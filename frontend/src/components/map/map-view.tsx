import { Map } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Utils } from 'common';
import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type { ReactNode } from 'react';

import {
    mapInitialLatitude,
    mapInitialLongitude,
    mapInitialZoom,
    mapStyleDark,
    mapStyleLight,
} from '@/config/env';
import { useTheme } from '@/hooks/use-theme';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

export type MapViewState = Utils.LngLat & { zoom: number };

type MapViewProps = {
    initialView?: MapViewState;
    onViewChange?: (view: MapViewState) => void;
    onMapClick: (position: LngLat) => void;
    children?: ReactNode;
};

const MapView = ({
    initialView,
    onViewChange,
    onMapClick,
    children,
}: MapViewProps) => {
    const { theme } = useTheme();

    return (
        <Map
            initialViewState={{
                longitude: initialView?.lng ?? mapInitialLongitude,
                latitude: initialView?.lat ?? mapInitialLatitude,
                zoom: initialView?.zoom ?? mapInitialZoom,
            }}
            style={{ width: '100%', height: '100%' }}
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
