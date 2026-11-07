import type { Api } from 'common';
import type { Position } from 'geojson';
import type { ReactNode } from 'react';

import { MapCallout, type MapCalloutProps } from '@/components/map/map-callout';
import { RoutePathDetails } from '@/features/trip-comparison/components/route-path-details';
import { RoutePathSummary } from '@/features/trip-comparison/components/route-path-summary';

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
                <RoutePathSummary
                    steps={steps}
                    badge={badge}
                    selected={selected}
                    compact={!selected}
                />
            }
            details={<RoutePathDetails steps={steps} />}
        />
    );
};

export default MapRoutePathCallout;
