import { Marker } from '@vis.gl/react-maplibre';
import type { Position } from 'geojson';
import { useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { useScreenOffset } from '@/hooks/use-screen-offset';
import { cn } from '@/lib/utils';
import { isLongPress } from '@/utils/long-press';
import { markerStacking } from '@/utils/marker-stacking';

const stopPropagation = (event: Event) => {
    event.stopPropagation();
};

// So double-clicking a label doesn't zoom. As a listener on the element, since
// React's run after the map's.
const stopDoubleClickReachingMap = (button: HTMLButtonElement | null) => {
    button?.addEventListener('dblclick', stopPropagation);
};

export interface MapCalloutProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    /** Among the labels, higher is in front. `0` by default. */
    stackOrder?: number;
    onClick?: () => void;
    onPress?: () => void;
    /** The point the label refers to, linked to it by a leader. As `[longitude, latitude]`. */
    anchor: Position;
    /** Where the label was dragged to, as `[longitude, latitude]`. */
    onDrag: (position: Position) => void;
    /** Where the label was dropped at the end of a drag, as `[longitude, latitude]`. */
    onDrop: (position: Position) => void;
    children: ReactNode;
}

export const MapCallout = ({
    position,
    selected,
    stackOrder = 0,
    onClick,
    onPress,
    anchor,
    onDrag,
    onDrop,
    children,
}: MapCalloutProps) => {
    const [longitude = 0, latitude = 0] = position;
    const [anchorLongitude = 0, anchorLatitude = 0] = anchor;
    const labelOffset = useScreenOffset(anchor, position);
    const isDragging = useRef(false);
    // Null unless pressed by a mouse or finger: keyboard clicks aren't long presses
    const pressStartedAt = useRef<number | null>(null);

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
                style={{ zIndex: markerStacking.label + stackOrder }}
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

                    const wasLongPress =
                        pressStartedAt.current !== null &&
                        isLongPress(pressStartedAt.current);
                    pressStartedAt.current = null;
                    if (isDragging.current || wasLongPress) {
                        // Ignore the click when a drag or a long press ends
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
                    onPointerDown={() => {
                        pressStartedAt.current = Date.now();
                        onPress?.();
                    }}
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
