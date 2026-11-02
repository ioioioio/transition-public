import type { Api } from 'common';
import type { Position } from 'geojson';
import * as m from 'motion/react-m';
import type { ReactNode, RefCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { LineLabel } from '@/components/map/labeled-line-layer';
import {
    RoutePathCardDetails,
    RoutePathCardHeader,
    type RouteSummaryLayoutIds,
} from '@/features/trip-comparison/components/route-path-card';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import type { LabelEdge, LabelOffset } from '@/hooks/use-label-placement';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { resizeTransition } from '@/utils/label-animation';
import { modeIcons } from '@/utils/mode';

interface RoutePathLabelProps {
    id: string;
    /** As `[longitude, latitude]`. */
    position: Position;
    offset: LabelOffset;
    offsetEdge: LabelEdge;
    steps: Api.RouteStep[];
    // Only shown once expanded
    badge?: ReactNode;
    selected: boolean;
    // Into the route's card, with its details
    expanded: boolean;
    onClick: () => void;
    onDrag: (movement: LabelOffset) => void;
    ref?: RefCallback<HTMLDivElement>;
}

// Sums up a route on the map
const RoutePathLabel = ({
    id,
    position,
    offset,
    offsetEdge,
    steps,
    badge,
    selected,
    expanded,
    onClick,
    onDrag,
    ref,
}: RoutePathLabelProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';
    const MainModeIcon = modeIcons[mainMode];
    // Shared by its small summary and its card, so they glide from one to the
    // other
    const layoutIds: RouteSummaryLayoutIds = {
        icon: `route-label-${id}-icon`,
        travelTime: `route-label-${id}-travel-time`,
    };

    if (expanded) {
        return (
            <LineLabel
                position={position}
                offset={offset}
                offsetEdge={offsetEdge}
                selected={selected}
                onClick={onClick}
                onDrag={onDrag}
                ref={ref}
                className="w-72 rounded-lg text-sm text-foreground"
                buttonClassName="w-full gap-3 px-4 py-3 text-left whitespace-normal [&_svg]:size-auto"
                details={
                    <div className="px-4 pb-3 font-normal">
                        <RoutePathCardDetails steps={steps} />
                    </div>
                }
            >
                <RoutePathCardHeader
                    steps={steps}
                    badge={badge}
                    selected={selected}
                    layoutIds={layoutIds}
                />
            </LineLabel>
        );
    }

    return (
        <LineLabel
            position={position}
            offset={offset}
            offsetEdge={offsetEdge}
            selected={selected}
            onClick={onClick}
            onDrag={onDrag}
            ref={ref}
        >
            <m.span
                layoutId={layoutIds.icon}
                // Only between its summary and card, not as the map moves
                layoutDependency={layoutIds.icon}
                transition={{ layout: resizeTransition }}
                className="flex"
            >
                <MainModeIcon role="img" aria-label={modeLabels[mainMode]} />
            </m.span>
            <m.span
                layoutId={layoutIds.travelTime}
                // Only between its summary and card, not as the map moves
                layoutDependency={layoutIds.travelTime}
                transition={{ layout: resizeTransition }}
            >
                {formatDuration(travelTimeSeconds, i18n.language)}
            </m.span>
        </LineLabel>
    );
};

export default RoutePathLabel;
