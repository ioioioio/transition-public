import { CaretDownIcon } from '@phosphor-icons/react';
import { Marker } from '@vis.gl/react-maplibre';
import type { Utils } from 'common';
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

// So pressing its body doesn't drag it, and its text can be selected
const stopPressReachingMarker = (element: HTMLElement | null) => {
    element?.addEventListener('mousedown', stopPropagation);
    element?.addEventListener('touchstart', stopPropagation);
};

// So scrolling its body doesn't zoom the map
const stopWheelReachingMap = (element: HTMLElement | null) => {
    element?.addEventListener('wheel', stopPropagation);
};

export interface CalloutPosition {
    label: Utils.LngLat;
    /** The point the label refers to, linked to it by a leader. */
    anchor: Utils.LngLat;
}

export interface MapCalloutProps {
    position: CalloutPosition;
    selected: boolean;
    /** Shows `body`. */
    expanded: boolean;
    /** Whether clicking it can expand it. */
    expandable: boolean;
    /** Among the labels, higher is in front. `0` by default. */
    stackOrder?: number;
    onClick?: () => void;
    onPress?: () => void;
    /** Where the label was dragged to. */
    onDrag: (position: Utils.LngLat) => void;
    /** Where the label was dropped at the end of a drag. */
    onDrop: (position: Utils.LngLat) => void;
    /** In its button. */
    header: ReactNode;
    /** Under its button, while `expanded`. Clicking it doesn't call `onClick`. */
    body: ReactNode;
    /** Under its body, while `expanded`. */
    footer: ReactNode;
}

export const MapCallout = ({
    position,
    selected,
    expanded,
    expandable,
    stackOrder = 0,
    onClick,
    onPress,
    onDrag,
    onDrop,
    header,
    body,
    footer,
}: MapCalloutProps) => {
    const labelOffset = useScreenOffset(position.anchor, position.label);
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
                longitude={position.anchor.lng}
                latitude={position.anchor.lat}
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
                longitude={position.label.lng}
                latitude={position.label.lat}
                style={{ zIndex: markerStacking.label + stackOrder }}
                draggable
                onDragStart={() => {
                    isDragging.current = true;
                }}
                onDrag={(event) => {
                    // At once, as the map moves the label, so its leader keeps up
                    flushSync(() => {
                        onDrag(event.lngLat);
                    });
                }}
                onDragEnd={(event) => {
                    onDrop(event.lngLat);
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
                    const { target } = event.originalEvent;
                    const isOnButton =
                        target instanceof Node &&
                        button.current?.contains(target) === true;
                    if (isDragging.current || wasLongPress || !isOnButton) {
                        return;
                    }

                    onClick?.();
                }}
            >
                <Collapsible
                    open={expanded}
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
                        expanded
                            ? 'w-72 rounded-lg border-primary text-foreground'
                            : [
                                  'rounded-md',
                                  selected
                                      ? 'border-primary text-primary'
                                      : `
                                          border-foreground/20
                                          text-foreground/80
                                      `,
                              ],
                    )}
                >
                    <button
                        ref={button}
                        type="button"
                        aria-pressed={selected}
                        aria-expanded={expandable ? expanded : undefined}
                        className={cn(
                            `
                                m-1 flex cursor-[inherit] items-center gap-2
                                rounded-sm px-2 py-1 whitespace-nowrap
                                tabular-nums outline-none
                                hover:bg-muted
                                [&_svg]:size-4
                            `,
                            expanded &&
                                `
                                    w-70 shrink-0 gap-3 rounded-md px-3 py-2
                                    text-left whitespace-normal
                                    [&_svg]:size-auto
                                `,
                        )}
                    >
                        {header}
                        {expandable && (
                            <CaretDownIcon
                                aria-hidden
                                className={cn(
                                    `
                                        shrink-0 text-muted-foreground
                                        transition-transform duration-150
                                        motion-reduce:transition-none
                                    `,
                                    expanded && 'rotate-180',
                                )}
                            />
                        )}
                    </button>
                    <CollapsibleContent
                        ref={(element) => {
                            stopPressReachingMarker(element);
                            stopWheelReachingMap(element);
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
                        <div
                            className="
                                flex w-72 flex-col gap-2 px-4 pb-3 font-normal
                            "
                        >
                            <div
                                className="
                                    max-h-25 scrollbar-thin
                                    [scrollbar-color:var(--border)_transparent]
                                    overflow-y-auto border-t border-border pt-2
                                "
                            >
                                {body}
                            </div>
                            {footer}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Marker>
        </>
    );
};
