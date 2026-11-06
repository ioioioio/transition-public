import type { Api } from 'common';
import type { Position } from 'geojson';
import { useTranslation } from 'react-i18next';

import { MapCallout, type MapCalloutProps } from '@/components/map/map-callout';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface MapRouteCalloutProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    steps: Api.RouteStep[];
    selected: boolean;
    stackOrder: number;
    onClick: () => void;
    onPress?: MapCalloutProps['onPress'];
    anchor: MapCalloutProps['anchor'];
    onDrag: MapCalloutProps['onDrag'];
    onDrop: MapCalloutProps['onDrop'];
}

// Sums up a route on the map
const MapRouteCallout = ({
    position,
    steps,
    selected,
    stackOrder,
    onClick,
    onPress,
    anchor,
    onDrag,
    onDrop,
}: MapRouteCalloutProps) => {
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
        >
            <MainModeIcon role="img" aria-label={modeLabels[mainMode]} />
            {formatDuration(travelTimeSeconds, i18n.language)}
        </MapCallout>
    );
};

export default MapRouteCallout;
