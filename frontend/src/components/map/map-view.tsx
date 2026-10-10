import { Map, type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Utils } from 'common';
import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useState, type ReactNode } from 'react';

import { mapStyleDark, mapStyleLight } from '@/config/env';
import {
    createLayerClickHandlers,
    LayerClickHandlersContext,
} from '@/hooks/use-layer-click';
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
    const [handlers] = useState(createLayerClickHandlers);
    // The topmost of the clickable layers under the pointer
    const findClickedLayerId = ({ target, point }: MapLayerMouseEvent) => {
        const layers = [...handlers.keys()].filter((id) => target.getLayer(id));
        return layers.length > 0
            ? target.queryRenderedFeatures(point, { layers }).at(0)?.layer.id
            : undefined;
    };
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
            onClick={(event) => {
                const layerId = findClickedLayerId(event);
                if (layerId) {
                    handlers.get(layerId)?.();
                } else {
                    onMapClick(event.lngLat);
                }
            }}
            onMouseMove={(event) => {
                event.target.getCanvas().style.cursor = findClickedLayerId(
                    event,
                )
                    ? 'pointer'
                    : '';
            }}
            onMoveEnd={({ viewState }) =>
                onViewChange?.({
                    lng: viewState.longitude,
                    lat: viewState.latitude,
                    zoom: viewState.zoom,
                })
            }
        >
            <LayerClickHandlersContext value={handlers}>
                {children}
            </LayerClickHandlersContext>
        </Map>
    );
};

export default MapView;
