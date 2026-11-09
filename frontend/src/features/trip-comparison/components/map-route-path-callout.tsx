import type { Api } from 'common';
import type { Position } from 'geojson';
import type { ReactNode } from 'react';

import { MapCallout, type MapCalloutProps } from '@/components/map/map-callout';
import { RoutePathSummaryBody } from '@/features/trip-comparison/components/route-path-summary/route-path-summary-body';
import { RoutePathSummaryFooter } from '@/features/trip-comparison/components/route-path-summary/route-path-summary-footer';
import { RoutePathSummaryHeader } from '@/features/trip-comparison/components/route-path-summary/route-path-summary-header';

interface MapRoutePathCalloutProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
    expanded: boolean;
    expandable: boolean;
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
    expanded,
    expandable,
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
            expanded={expanded}
            expandable={expandable}
            stackOrder={stackOrder}
            onClick={onClick}
            onPress={onPress}
            anchor={anchor}
            onDrag={onDrag}
            onDrop={onDrop}
            header={
                <RoutePathSummaryHeader
                    steps={steps}
                    badge={badge}
                    selected={selected}
                    compact={!expanded}
                />
            }
            body={<RoutePathSummaryBody steps={steps} />}
            footer={<RoutePathSummaryFooter steps={steps} />}
        />
    );
};

export default MapRoutePathCallout;
