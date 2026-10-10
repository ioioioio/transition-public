import { Layer, Marker, Source } from '@vis.gl/react-maplibre';
import type { Position } from 'geojson';
import type { ReactNode } from 'react';

import { useLayerClick } from '@/hooks/use-layer-click';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/utils';
import { createCurve, getPointAlong } from '@/utils/geo';

export type LabeledCurveStyles = {
    /** How far the arc bends from the straight line, as a fraction of its length. */
    bend: number;
    /** Dash and gap lengths, in line widths. Solid when omitted. */
    dashArray?: [number, number];
    /** Where the label sits along the arc, from `0` (start) to `1` (end). */
    labelPosition?: number;
};

export type LabeledCurveProps = {
    id: string;
    /** As `[longitude, latitude]`. */
    from: Position;
    /** As `[longitude, latitude]`. */
    to: Position;
    styles: LabeledCurveStyles;
    selected?: boolean;
    /** Shown in a pill on the arc. */
    label?: ReactNode;
    onClick?: () => void;
};

// An arc between two points, with an optional label on it
export const LabeledCurve = ({
    id,
    from,
    to,
    styles,
    selected = false,
    label,
    onClick,
}: LabeledCurveProps) => {
    const { bend, dashArray, labelPosition = 0.5 } = styles;
    const color = useThemeColor(selected ? '--primary' : '--foreground');
    const curve = createCurve(from, to, bend);
    const hitLayerId = `${id}-hit`;
    useLayerClick(hitLayerId, onClick);
    // A finger needs a wider target than a mouse
    const hitWidth = useMediaQuery('(pointer: coarse)') ? 40 : 16;

    return (
        <>
            <Source id={id} type="geojson" data={curve}>
                {selected && (
                    <Layer
                        id={`${id}-glow`}
                        type="line"
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        paint={{
                            'line-color': color,
                            'line-width': 12,
                            'line-opacity': 0.22,
                        }}
                    />
                )}
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
            </Source>
            {label && (
                <CurveLabel
                    position={getPointAlong(curve, labelPosition)}
                    selected={selected}
                    onClick={onClick}
                >
                    {label}
                </CurveLabel>
            )}
        </>
    );
};

type CurveLabelProps = {
    /** As `[longitude, latitude]`. */
    position: Position;
    selected: boolean;
    onClick?: () => void;
    children: ReactNode;
};

const CurveLabel = ({
    position,
    selected,
    onClick,
    children,
}: CurveLabelProps) => {
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
