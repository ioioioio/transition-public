import { CaretRightIcon, type Icon } from '@phosphor-icons/react';
import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import { useRef, type ReactNode, type RefCallback } from 'react';

import { MapIconImage } from '@/components/map/map-icon-image';
import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useZoomForLength } from '@/hooks/use-zoom-for-length';
import { cn } from '@/lib/utils';
import { markerLayers } from '@/utils/marker-layers';

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

// So clicking a label twice doesn't zoom, and dragging one doesn't pan. On the
// element itself, as React's handlers run after the map's. Layers need to be
// handled differently, see MapView.
const stopGesturesReachingMap = (
    button: HTMLButtonElement | null,
    isDraggable: boolean,
) => {
    button?.addEventListener('dblclick', stopPropagation);
    button?.addEventListener('touchstart', stopPropagation);
    if (isDraggable) {
        button?.addEventListener('mousedown', stopPropagation);
    }
};

// Below this, in pixels, a press is still a click
const dragThreshold = 4;

interface Drag {
    lastPointer: { x: number; y: number };
    hasMoved: boolean;
}

export interface LineLabelProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    onClick?: () => void;
    /**
     * From `position` to the label's centre, in pixels. The label is then linked to `position` by a
     * leader. On `position` when omitted.
     */
    offset?: { x: number; y: number };
    /** Makes the label draggable, with how far it moved since the last call, in pixels. */
    onDrag?: (movement: { x: number; y: number }) => void;
    ref?: RefCallback<HTMLButtonElement>;
    children: ReactNode;
}

export const LineLabel = ({
    position,
    selected,
    onClick,
    offset,
    onDrag,
    ref,
    children,
}: LineLabelProps) => {
    const [longitude, latitude] = position;
    const drag = useRef<Drag | null>(null);
    // The click that ends a drag doesn't count
    const wasDragged = useRef(false);
    const button = (
        <button
            ref={(element) => {
                stopGesturesReachingMap(element, onDrag !== undefined);
                return ref?.(element);
            }}
            type="button"
            aria-pressed={selected}
            onPointerDown={(event) => {
                if (!onDrag) {
                    return;
                }
                // Keeps following the pointer when it leaves the label
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = {
                    lastPointer: { x: event.clientX, y: event.clientY },
                    hasMoved: false,
                };
            }}
            onPointerMove={(event) => {
                const current = drag.current;
                if (!current || !onDrag) {
                    return;
                }
                const movement = {
                    x: event.clientX - current.lastPointer.x,
                    y: event.clientY - current.lastPointer.y,
                };
                if (
                    !current.hasMoved &&
                    Math.hypot(movement.x, movement.y) < dragThreshold
                ) {
                    return;
                }
                drag.current = {
                    lastPointer: { x: event.clientX, y: event.clientY },
                    hasMoved: true,
                };
                onDrag(movement);
            }}
            onPointerUp={() => {
                wasDragged.current = drag.current?.hasMoved ?? false;
                drag.current = null;
            }}
            onPointerCancel={() => {
                drag.current = null;
            }}
            style={
                offset && {
                    transform: `translate(${String(offset.x)}px, ${String(offset.y)}px) translate(-50%, -50%)`,
                }
            }
            className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium whitespace-nowrap tabular-nums shadow-[0_4px_14px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4',
                selected
                    ? 'border-primary text-primary'
                    : 'border-foreground/20 text-foreground/80',
                offset && 'absolute top-0 left-0',
                // So touches drag the label rather than scroll the page
                onDrag && 'cursor-grab touch-none active:cursor-grabbing',
            )}
        >
            {children}
        </button>
    );

    const label = (
        <Marker
            longitude={longitude}
            latitude={latitude}
            style={{ zIndex: markerLayers.label }}
            onClick={(event) => {
                // Keeps the click off the map, but also from reaching the
                // button's `onClick`, so it's handled here instead.
                event.originalEvent.stopPropagation();
                if (wasDragged.current) {
                    wasDragged.current = false;
                    return;
                }
                onClick?.();
            }}
        >
            {offset ? (
                // No size of its own, so the marker is centred on `position`
                <div className="relative size-0">{button}</div>
            ) : (
                button
            )}
        </Marker>
    );
    if (!offset) {
        return label;
    }

    return (
        <>
            {/* A marker of its own, so it can be below every label */}
            <Marker
                longitude={longitude}
                latitude={latitude}
                style={{ zIndex: markerLayers.leader }}
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
                            x2={offset.x}
                            y2={offset.y}
                            stroke="currentColor"
                            strokeWidth={1.5}
                        />
                        <circle r={3} fill="currentColor" />
                    </svg>
                </div>
            </Marker>
            {label}
        </>
    );
};
