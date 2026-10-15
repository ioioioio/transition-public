import { Map, type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Utils } from 'common';
import { setWorkerUrl, type LngLat } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useRef, useState, type ReactNode } from 'react';

import { config } from '@/config/config';
import {
    createLayerClickHandlers,
    LayerClickHandlersContext,
} from '@/hooks/use-layer-click';
import { useTheme } from '@/hooks/use-theme';

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl);

export type MapCamera = Utils.LngLat & { zoom: number };

type MapViewProps = {
    camera: MapCamera;
    onCameraChange?: (camera: MapCamera) => void;
    onMapClick: (position: LngLat) => void;
    children?: ReactNode;
};

const MapView = ({
    camera,
    onCameraChange,
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
    const zoomPause = useRef<ReturnType<typeof setTimeout>>(undefined);
    // So clicking a layer twice doesn't zoom.
    const pauseDoubleClickZoom = ({ target }: MapLayerMouseEvent) => {
        target.doubleClickZoom.disable();
        clearTimeout(zoomPause.current);
        zoomPause.current = setTimeout(
            () => target.doubleClickZoom.enable(),
            500,
        );
    };
    return (
        <Map
            initialViewState={{
                longitude: camera.lng,
                latitude: camera.lat,
                zoom: camera.zoom,
            }}
            style={{ width: '100%', height: '100%' }}
            // Attribution should always be visible so people don't forget to turn it on for screenshots
            attributionControl={{ compact: false }}
            mapStyle={config.map.styles[theme]}
            onClick={(event) => {
                const layerId = findClickedLayerId(event);
                if (layerId) {
                    pauseDoubleClickZoom(event);
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
                onCameraChange?.({
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
