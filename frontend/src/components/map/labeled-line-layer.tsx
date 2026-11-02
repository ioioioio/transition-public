import { CaretRightIcon, type Icon } from '@phosphor-icons/react';
import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { LineString, Position } from 'geojson';
import * as m from 'motion/react-m';
import { useRef, type ReactNode, type RefCallback } from 'react';

import { MapIconImage } from '@/components/map/map-icon-image';
import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useZoomForLength } from '@/hooks/use-zoom-for-length';
import { cn } from '@/lib/utils';
import { resizeTransition } from '@/utils/label-animation';
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
    element: HTMLElement | null,
    isDraggable: boolean,
) => {
    element?.addEventListener('dblclick', stopPropagation);
    element?.addEventListener('touchstart', stopPropagation);
    if (isDraggable) {
        element?.addEventListener('mousedown', stopPropagation);
    }
};

// Puts the label's point at its edge, or its centre, where it's moved from
const edgeTranslations = {
    center: '-translate-1/2',
    left: '-translate-y-1/2',
    right: '-translate-x-full -translate-y-1/2',
    top: '-translate-x-1/2',
    bottom: '-translate-x-1/2 -translate-y-full',
} as const;

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
     * From `position` to the label's `offsetEdge`, in pixels. The label is then linked to
     * `position` by a leader. On `position` when omitted.
     */
    offset?: { x: number; y: number };
    /**
     * Which point of the label `offset` leads to: the middle of an edge, so it grows and shrinks
     * away from it, or its centre. Its centre by default.
     */
    offsetEdge?: 'center' | 'left' | 'right' | 'top' | 'bottom';
    /** Makes the label draggable, with how far it moved since the last call, in pixels. */
    onDrag?: (movement: { x: number; y: number }) => void;
    /** Overrides the look of its box. */
    className?: string;
    /** Overrides the look of its button, which fills its box unless it has details. */
    buttonClassName?: string;
    ref?: RefCallback<HTMLDivElement>;
    /** In its button. */
    children: ReactNode;
    /** Below its button, in its box, like a card's content. Clicking them doesn't call `onClick`. */
    details?: ReactNode;
}

export const LineLabel = ({
    position,
    selected,
    onClick,
    offset,
    offsetEdge = 'center',
    onDrag,
    className,
    buttonClassName,
    ref,
    children,
    details,
}: LineLabelProps) => {
    const [longitude, latitude] = position;
    const drag = useRef<Drag | null>(null);
    // The click that ends a drag doesn't count
    const wasDragged = useRef(false);
    // Where the click started, as a drag captures the pointer, so its click is
    // on the label's box wherever it started
    const wasPressOnButton = useRef(false);

    // Opening or closing its details resizes the label smoothly. Only then, so
    // it follows the map at once as it moves.
    const hasDetails = details !== undefined;
    const box = (
        <m.div
            layout
            layoutDependency={hasDetails}
            transition={{ layout: resizeTransition }}
            style={offset}
            ref={(element) => {
                stopGesturesReachingMap(element, onDrag !== undefined);
                return ref?.(element);
            }}
            onPointerDown={(event) => {
                wasPressOnButton.current =
                    event.target instanceof Element &&
                    event.target.closest('button') !== null;
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
            className={cn(
                'cursor-pointer rounded-md border bg-background text-sm font-medium shadow-[0_4px_14px_rgba(0,0,0,0.45)] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                selected
                    ? 'border-primary text-primary'
                    : 'border-foreground/20 text-foreground/80',
                // Moved by `offset`, from the point of it at `offsetEdge`
                offset && [
                    'absolute top-0 left-0',
                    edgeTranslations[offsetEdge],
                ],
                // So touches drag the label rather than scroll the page
                onDrag && 'cursor-grab touch-none active:cursor-grabbing',
                className,
            )}
        >
            {/* So it isn't stretched while the label is resized */}
            <m.button
                layout
                layoutDependency={hasDetails}
                transition={{ layout: resizeTransition }}
                type="button"
                aria-pressed={selected}
                className={cn(
                    'flex cursor-[inherit] items-center gap-2 px-3 py-2 whitespace-nowrap tabular-nums outline-none [&_svg]:size-4',
                    buttonClassName,
                )}
            >
                {children}
            </m.button>
            {details && (
                <m.div
                    layout
                    layoutDependency={hasDetails}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        layout: resizeTransition,
                        ...resizeTransition,
                    }}
                >
                    {details}
                </m.div>
            )}
        </m.div>
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
                // Not its details, like a card's content
                if (!wasPressOnButton.current) {
                    return;
                }
                onClick?.();
            }}
        >
            {offset ? (
                // No size of its own, so the marker is centred on `position`
                <div className="relative size-0">{box}</div>
            ) : (
                box
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
