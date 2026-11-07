import { Marker } from '@vis.gl/react-maplibre';
import type { Position } from 'geojson';
import { useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useScreenOffset } from '@/hooks/map/use-screen-offset';
import { cn } from '@/lib/utils';
import { isLongPress } from '@/utils/long-press';
import { markerStacking } from '@/utils/marker-stacking';

const stopPropagation = (event: Event) => {
    event.stopPropagation();
};

// So double-clicking a label doesn't zoom. As a listener on the element, since
// React's run after the map's.
const stopDoubleClickReachingMap = (element: HTMLElement | null) => {
    element?.addEventListener('dblclick', stopPropagation);
};

// So pressing its details doesn't drag it, and their text can be selected
const stopPressReachingMarker = (element: HTMLElement | null) => {
    element?.addEventListener('mousedown', stopPropagation);
    element?.addEventListener('touchstart', stopPropagation);
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
    /** In its button. */
    header: ReactNode;
    /** Under its button, while `selected`. Clicking them doesn't call `onClick`. */
    details: ReactNode;
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
    header,
    details,
}: MapCalloutProps) => {
    const [longitude = 0, latitude = 0] = position;
    const [anchorLongitude = 0, anchorLatitude = 0] = anchor;
    const labelOffset = useScreenOffset(anchor, position);
    const isDragging = useRef(false);
    // Null unless pressed by a mouse or finger: keyboard clicks aren't long presses
    const pressStartedAt = useRef<number | null>(null);
    const button = useRef<HTMLButtonElement>(null);

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
                            `
                                pointer-events-none absolute top-0 left-0
                                overflow-visible
                            `,
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
                    const { target } = event.originalEvent;
                    const isOnButton =
                        target instanceof Node &&
                        button.current?.contains(target) === true;
                    // So clicking its details doesn't close it
                    if (!isOnButton) {
                        return;
                    }

                    onClick?.();
                }}
            >
                <Collapsible
                    open={selected}
                    ref={(element) => {
                        stopDoubleClickReachingMap(element);
                    }}
                    onPointerDown={() => {
                        pressStartedAt.current = Date.now();
                        onPress?.();
                    }}
                    className={cn(
                        `
                            cursor-grab touch-none overflow-hidden border
                            bg-background text-sm font-medium
                            shadow-[0_4px_14px_rgba(0,0,0,0.45)]
                            transition-[width] duration-150
                            ease-[cubic-bezier(0.2,0,0,1)]
                            [interpolate-size:allow-keywords]
                            active:cursor-grabbing
                            has-focus-visible:ring-3
                            has-focus-visible:ring-ring/50
                            motion-reduce:transition-none
                        `,
                        selected
                            ? 'w-72 rounded-lg border-primary text-foreground'
                            : `
                                rounded-md border-foreground/20
                                text-foreground/80
                            `,
                    )}
                >
                    <button
                        ref={button}
                        type="button"
                        aria-pressed={selected}
                        className={cn(
                            `
                                flex cursor-[inherit] items-center gap-2 px-3
                                py-2 whitespace-nowrap tabular-nums outline-none
                                [&_svg]:size-4
                            `,
                            selected &&
                                `
                                    w-72 shrink-0 gap-3 px-4 py-3 text-left
                                    whitespace-normal
                                    [&_svg]:size-auto
                                `,
                        )}
                    >
                        {header}
                    </button>
                    <CollapsibleContent
                        ref={(element) => {
                            stopPressReachingMarker(element);
                        }}
                        className="
                            h-(--collapsible-panel-height) cursor-auto
                            touch-auto overflow-hidden
                            transition-[height,opacity] duration-150
                            ease-[cubic-bezier(0.2,0,0,1)] contain-[inline-size]
                            select-text
                            data-ending-style:h-0 data-ending-style:opacity-0
                            data-starting-style:h-0
                            data-starting-style:opacity-0
                            motion-reduce:transition-none
                        "
                    >
                        <div className="w-72 px-4 pb-3 font-normal">
                            {details}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Marker>
        </>
    );
};
