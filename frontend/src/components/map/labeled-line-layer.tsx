import type { Icon } from '@phosphor-icons/react';
import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import type { ReactNode } from 'react';

import { MapIconImage } from '@/components/map/map-icon-image';
import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useZoomForLength } from '@/hooks/use-zoom-for-length';
import { cn } from '@/lib/utils';
import { getPointAlong } from '@/utils/geo';

export interface LabeledLineLayerStyles {
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
    /** Where the label sits along the line, from `0` (start) to `1` (end). */
    labelPosition?: number;
}

export type LineEmphasis = 'default' | 'selected' | 'muted';

export interface LabeledLineLayerProps {
    id: string;
    geometry: LineString;
    styles: LabeledLineLayerStyles;
    /** How much the line stands out from the others. */
    emphasis: LineEmphasis;
    /** Shown in a pill on the line. */
    label?: ReactNode;
    /** Repeated along the line, drawn by the map. */
    icon: Icon;
    onClick?: () => void;
}

// Between repeated icons, in pixels
const iconSpacing = 75;

// A line, with an optional label on it
export const LabeledLineLayer = ({
    id,
    geometry,
    styles,
    emphasis,
    label,
    icon,
    onClick,
}: LabeledLineLayerProps) => {
    const { dashArray, labelPosition = 0.5 } = styles;
    const selected = emphasis === 'selected';
    // Out of the way of the selected line's labels
    const shownLabel = emphasis === 'muted' ? undefined : label;
    const color = useThemeColor(selected ? '--primary' : '--foreground');
    const hitLayerId = `${id}-hit`;
    useLayerClick(hitLayerId, onClick);
    // A finger needs a wider target than a mouse
    const hitWidth = useMediaQuery('(pointer: coarse)') ? 40 : 16;
    const haloColor = useThemeColor('--background');
    const iconImageId = `${id}-icon-${color}-${haloColor}`;
    const iconRepeatZoom = useZoomForLength(geometry, iconSpacing * 2);

    return (
        <>
            <Source id={id} type="geojson" data={geometry}>
                <Layer
                    id={`${id}-glow`}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                        'line-color': color,
                        'line-width': 12,
                        'line-opacity': selected ? 0.22 : 0,
                    }}
                />
                <Layer
                    id={`${id}-line`}
                    type="line"
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    paint={{
                        'line-color': color,
                        'line-width': selected ? 4 : 2.5,
                        'line-opacity': selected ? 1 : 0.5,
                        ...(dashArray && { 'line-dasharray': dashArray }),
                    }}
                />
                {/* Wider than the line, so it's easy to click or tap */}
                <Layer
                    id={hitLayerId}
                    type="line"
                    paint={{ 'line-width': hitWidth, 'line-opacity': 0 }}
                />
                {/* Repeated icons start near the line's start, so they'd
                    crowd its start while the line is short on screen */}
                <Layer
                    id={`${id}-icon-center`}
                    type="symbol"
                    maxzoom={iconRepeatZoom}
                    layout={{
                        visibility: emphasis === 'muted' ? 'none' : 'visible',
                        'symbol-placement': 'line-center',
                        'icon-image': iconImageId,
                        'icon-allow-overlap': true,
                        'icon-keep-upright': true,
                    }}
                />
                <Layer
                    id={`${id}-icon`}
                    type="symbol"
                    minzoom={iconRepeatZoom}
                    layout={{
                        visibility: emphasis === 'muted' ? 'none' : 'visible',
                        'symbol-placement': 'line',
                        'symbol-spacing': iconSpacing,
                        'icon-image': iconImageId,
                        'icon-allow-overlap': true,
                        'icon-keep-upright': true,
                    }}
                />
            </Source>
            <MapIconImage
                id={iconImageId}
                icon={icon}
                color={color}
                haloColor={haloColor}
                size={16}
            />
            {shownLabel && (
                <LineLabel
                    position={getPointAlong(geometry, labelPosition)}
                    selected={selected}
                    onClick={onClick}
                >
                    {shownLabel}
                </LineLabel>
            )}
        </>
    );
};

const stopPropagation = (event: Event) => {
    event.stopPropagation();
};

// So clicking a label twice doesn't zoom. Layers need to be handled
// differently, see MapView.
const stopGesturesReachingMap = (button: HTMLButtonElement | null) => {
    button?.addEventListener('dblclick', stopPropagation);
    button?.addEventListener('touchstart', stopPropagation);
};

interface LineLabelProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    onClick?: () => void;
    children: ReactNode;
}

const LineLabel = ({
    position,
    selected,
    onClick,
    children,
}: LineLabelProps) => {
    const [longitude, latitude] = position;

    return (
        <Marker
            longitude={longitude}
            latitude={latitude}
            onClick={(event) => {
                // Keeps the click off the map, but also from reaching the
                // button's `onClick`, so it's handled here instead.
                event.originalEvent.stopPropagation();
                onClick?.();
            }}
        >
            <button
                ref={stopGesturesReachingMap}
                type="button"
                aria-pressed={selected}
                className={cn(
                    'flex cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium whitespace-nowrap tabular-nums shadow-[0_4px_14px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5',
                    selected
                        ? 'border-primary text-primary'
                        : 'border-foreground/20 text-foreground/80',
                )}
            >
                {children}
            </button>
        </Marker>
    );
};
