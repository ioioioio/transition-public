import { CaretRightIcon, type Icon } from '@phosphor-icons/react';
import { Layer, Source } from '@vis.gl/react-maplibre';
import type { LineString } from 'geojson';

import { MapIconImage } from '@/components/map/map-icon-image';
import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useZoomForLength } from '@/hooks/use-zoom-for-length';
import { createNestedId } from '@/utils/nested-id';

export interface MapLineStyles {
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
}

export type LineEmphasis = 'default' | 'selected' | 'muted';

export interface MapLineProps {
    id: string;
    geometry: LineString;
    styles: MapLineStyles;
    /** The theme variable of the line's own color. */
    color: `--${string}`;
    /** How much the line stands out from the others. */
    emphasis: LineEmphasis;
    /** Repeated along the line, drawn by the map. */
    icon: Icon;
    onClick?: () => void;
    onPress?: () => void;
}

const lineOpacities: Record<LineEmphasis, number> = {
    default: 0.65,
    selected: 1,
    muted: 0.5,
};

const iconSizePixels = 16;
const iconSpacingPixels = 75;
const arrowSizePixels = 12;
const arrowSpacingPixels = 15;

export const MapLine = ({
    id,
    geometry,
    styles,
    color: colorVariable,
    emphasis,
    icon,
    onClick,
    onPress,
}: MapLineProps) => {
    const { dashArray } = styles;
    const selected = emphasis === 'selected';
    const color = useThemeColor(
        emphasis === 'muted' ? '--foreground' : colorVariable,
    );
    const hitLayerId = createNestedId(id, 'hit');
    useLayerClick(hitLayerId, onClick, onPress);
    // A finger needs a wider target than a mouse
    const hitWidth = useMediaQuery('(pointer: coarse)') ? 40 : 16;
    const haloColor = useThemeColor('--background');
    const iconImageId = `${id}-icon-${color}-${haloColor}`;
    const iconRepeatZoom = useZoomForLength(geometry, iconSpacingPixels * 2);
    const arrowImageId = `line-arrow-${color}-${haloColor}`;
    const iconLayout = {
        // Hidden rather than removed, so it keeps its place under other layers
        visibility: emphasis === 'muted' ? 'none' : 'visible',
        'icon-image': iconImageId,
        'icon-allow-overlap': true,
        'icon-keep-upright': true,
    } as const;

    return (
        <>
            <Source id={id} type="geojson" data={geometry}>
                <Layer
                    id={createNestedId(id, 'glow')}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                        'line-color': color,
                        'line-width': 12,
                        'line-opacity': selected ? 0.22 : 0,
                    }}
                />
                <Layer
                    id={createNestedId(id, 'line')}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                        'line-color': color,
                        'line-width': selected ? 4 : 2.5,
                        'line-opacity': lineOpacities[emphasis],
                        ...(dashArray && { 'line-dasharray': dashArray }),
                    }}
                />
                {/* Wider than the line, so it's easy to click or tap */}
                <Layer
                    id={hitLayerId}
                    type="line"
                    paint={{ 'line-width': hitWidth, 'line-opacity': 0 }}
                />
                {/* Which way the line goes */}
                <Layer
                    id={createNestedId(id, 'arrows')}
                    type="symbol"
                    layout={{
                        'symbol-placement': 'line',
                        'symbol-spacing': arrowSpacingPixels,
                        'icon-image': arrowImageId,
                        'icon-keep-upright': false,
                    }}
                    paint={{ 'icon-opacity': selected ? 1 : 0.5 }}
                />
                {/* Repeated icons start near the line's start, so they'd
                    crowd its start while the line is short on screen */}
                <Layer
                    id={createNestedId(id, 'icon-center')}
                    type="symbol"
                    maxzoom={iconRepeatZoom}
                    layout={{
                        'symbol-placement': 'line-center',
                        ...iconLayout,
                    }}
                />
                <Layer
                    id={createNestedId(id, 'icon')}
                    type="symbol"
                    minzoom={iconRepeatZoom}
                    layout={{
                        'symbol-placement': 'line',
                        'symbol-spacing': iconSpacingPixels,
                        ...iconLayout,
                    }}
                />
            </Source>
            <MapIconImage
                id={iconImageId}
                icon={icon}
                color={color}
                haloColor={haloColor}
                size={iconSizePixels}
            />
            <MapIconImage
                id={arrowImageId}
                icon={CaretRightIcon}
                color={color}
                haloColor={haloColor}
                size={arrowSizePixels}
            />
        </>
    );
};
