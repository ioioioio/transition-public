import { CaretRightIcon, type Icon } from '@phosphor-icons/react';
import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import { useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { MapIconImage } from '@/components/map/map-icon-image';
import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useScreenOffset } from '@/hooks/use-screen-offset';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useZoomForLength } from '@/hooks/use-zoom-for-length';
import { cn } from '@/lib/utils';
import { markerStacking } from '@/utils/marker-stacking';

export interface LabeledLineLayerStyles {
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
}

export type LineEmphasis = 'default' | 'selected' | 'muted';

export interface LabeledLineLayerProps {
    id: string;
    geometry: LineString;
    styles: LabeledLineLayerStyles;
    /** The theme variable of the line's own color. */
    color: `--${string}`;
    /** How much the line stands out from the others. */
    emphasis: LineEmphasis;
    /** Repeated along the line, drawn by the map. */
    icon: Icon;
    onClick?: () => void;
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

export const LabeledLineLayer = ({
    id,
    geometry,
    styles,
    color: colorVariable,
    emphasis,
    icon,
    onClick,
}: LabeledLineLayerProps) => {
    const { dashArray } = styles;
    const selected = emphasis === 'selected';
    const color = useThemeColor(
        emphasis === 'muted' ? '--foreground' : colorVariable,
    );
    const hitLayerId = `${id}-hit`;
    useLayerClick(hitLayerId, onClick);
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
                    id={`${id}-arrows`}
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
                    id={`${id}-icon-center`}
                    type="symbol"
                    maxzoom={iconRepeatZoom}
                    layout={{
                        'symbol-placement': 'line-center',
                        ...iconLayout,
                    }}
                />
                <Layer
                    id={`${id}-icon`}
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

const stopPropagation = (event: Event) => {
    event.stopPropagation();
};

// So double-clicking a label doesn't zoom. As a listener on the element, since
// React's run after the map's.
const stopDoubleClickReachingMap = (button: HTMLButtonElement | null) => {
    button?.addEventListener('dblclick', stopPropagation);
};

export interface LineLabelProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    onClick?: () => void;
    /** The point the label refers to, linked to it by a leader. As `[longitude, latitude]`. */
    anchor: Position;
    /** Where the label was dragged to, as `[longitude, latitude]`. */
    onDrag: (position: Position) => void;
    /** Where the label was dropped at the end of a drag, as `[longitude, latitude]`. */
    onDrop: (position: Position) => void;
    children: ReactNode;
}

export const LineLabel = ({
    position,
    selected,
    onClick,
    anchor,
    onDrag,
    onDrop,
    children,
}: LineLabelProps) => {
    const [longitude = 0, latitude = 0] = position;
    const [anchorLongitude = 0, anchorLatitude = 0] = anchor;
    const labelOffset = useScreenOffset(anchor, position);
    const isDragging = useRef(false);

    return (
        <>
            {/* The leader is drawn by its own so it can be below all labels */}
            {/* Not a MapLibre line layer, which would trail the label by a
                frame as it's dragged */}
            <Marker
                longitude={anchorLongitude}
                latitude={anchorLatitude}
                style={{ zIndex: markerStacking.leader }}
            >
                <div className="relative size-0">
                    <svg
                        aria-hidden
                        width={1}
                        height={1}
                        className={cn(
                            'pointer-events-none absolute top-0 left-0 overflow-visible',
                            selected ? 'text-primary' : 'text-foreground/50',
                        )}
                    >
                        <line
                            x1={0}
                            y1={0}
                            x2={labelOffset.x}
                            y2={labelOffset.y}
                            stroke="currentColor"
                            strokeWidth={1.5}
                        />
                        <circle r={3} fill="currentColor" />
                    </svg>
                </div>
            </Marker>
            <Marker
                longitude={longitude}
                latitude={latitude}
                style={{ zIndex: markerStacking.label }}
                draggable
                onDragStart={() => {
                    isDragging.current = true;
                }}
                onDrag={(event) => {
                    // At once, as the map moves the label, so its leader keeps up
                    flushSync(() => {
                        onDrag([event.lngLat.lng, event.lngLat.lat]);
                    });
                }}
                onDragEnd={(event) => {
                    onDrop([event.lngLat.lng, event.lngLat.lat]);
                    // Keep isDragging true until this event is handled,
                    // so onClick still sees it as a drag
                    setTimeout(() => {
                        isDragging.current = false;
                    });
                }}
                onClick={(event) => {
                    // Keeps the click off the map, which would take it as its own
                    event.originalEvent.stopPropagation();

                    if (isDragging.current) {
                        // Ignore the click when a drag ends
                        return;
                    }

                    onClick?.();
                }}
            >
                <button
                    ref={(element) => {
                        stopDoubleClickReachingMap(element);
                    }}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                        'flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap tabular-nums shadow-[0_4px_14px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4',
                        selected
                            ? 'border-primary text-primary'
                            : 'border-foreground/20 text-foreground/80',
                        'cursor-grab touch-none active:cursor-grabbing',
                    )}
                >
                    {children}
                </button>
            </Marker>
        </>
    );
};
