import { useMap } from '@vis.gl/react-maplibre';
import type { LineString } from 'geojson';
import type { Map as MaplibreMap } from 'maplibre-gl';

const calculateZoomForLength = (
    map: MaplibreMap,
    line: LineString,
    targetLengthPixels: number,
) => {
    const screenPoints = line.coordinates.map((position) => {
        const [longitude = 0, latitude = 0] = position;
        return map.project([longitude, latitude]);
    });
    const currentLengthPixels = screenPoints.reduce((total, point, index) => {
        const next = screenPoints.at(index + 1);
        return next ? total + point.dist(next) : total;
    }, 0);
    if (currentLengthPixels === 0) {
        return map.getMaxZoom();
    }
    // On a flat, untilted map, lengths double at each zoom level.
    // Measuring from the current zoom gives the same result at any zoom.
    const zoomLevelsAway = Math.log2(targetLengthPixels / currentLengthPixels);
    const zoom = map.getZoom() + zoomLevelsAway;
    return Math.min(Math.max(zoom, map.getMinZoom()), map.getMaxZoom());
};

/** Calculates the zoom from which a line is at least a given length on screen. */
export const useZoomForLength = (
    line: LineString,
    targetLengthPixels: number,
) => {
    const { current: mapRef } = useMap();
    if (!mapRef) {
        throw new Error('useZoomForLength must be used within a Map');
    }
    return calculateZoomForLength(mapRef.getMap(), line, targetLengthPixels);
};
