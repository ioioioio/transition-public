import type { Api } from 'common';
import type { Position } from 'geojson';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { MapCallout, type MapCalloutProps } from '@/components/map/map-callout';
import { RoutePathDetails } from '@/features/trip-comparison/components/route-path-details';
import { RoutePathSummary } from '@/features/trip-comparison/components/route-path-summary';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface MapRoutePathCalloutProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
    stackOrder: number;
    onClick: () => void;
    onPress?: MapCalloutProps['onPress'];
    anchor: MapCalloutProps['anchor'];
    onDrag: MapCalloutProps['onDrag'];
    onDrop: MapCalloutProps['onDrop'];
}

// Sums up a route on the map
const MapRoutePathCallout = ({
    position,
    steps,
    badge,
    selected,
    stackOrder,
    onClick,
    onPress,
    anchor,
    onDrag,
    onDrop,
}: MapRoutePathCalloutProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';
    const MainModeIcon = modeIcons[mainMode];

    return (
        <MapCallout
            position={position}
            selected={selected}
            stackOrder={stackOrder}
            onClick={onClick}
            onPress={onPress}
            anchor={anchor}
            onDrag={onDrag}
            onDrop={onDrop}
            header={
                selected ? (
                    <RoutePathSummary
                        steps={steps}
                        badge={badge}
                        selected={selected}
                    />
                ) : (
                    <>
                        <MainModeIcon
                            role="img"
                            aria-label={modeLabels[mainMode]}
                        />
                        {formatDuration(travelTimeSeconds, i18n.language)}
                    </>
                )
            }
            details={<RoutePathDetails steps={steps} />}
        />
    );
};

export default MapRoutePathCallout;
