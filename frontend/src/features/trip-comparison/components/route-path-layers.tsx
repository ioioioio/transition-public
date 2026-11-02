import type { Api } from 'common';
import { useMemo } from 'react';

import { RoutePathLayer } from '@/components/map/route-path-layer';
import type { RouteStepLayerStyles } from '@/components/map/route-step-layer';
import { BestRouteBadge } from '@/features/trip-comparison/components/route-path-card';
import RoutePathLabel from '@/features/trip-comparison/components/route-path-label';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import { useIsPhone } from '@/hooks/use-is-phone';
import { useLabelPlacement } from '@/hooks/use-label-placement';
import { createRoutePathGeometry, getRouteStepIcon } from '@/utils/route-step';

/**
 * Styles a path by its rank, from the fastest (`0`) to the slowest
 */
const createRoutePathStyles = (
    rank: number,
    count: number,
): RouteStepLayerStyles => {
    // From 0 for the fastest to 1 for the slowest
    const slowness = count > 1 ? rank / (count - 1) : 0;
    const side = rank % 2 === 0 ? 1 : -1;
    return {
        line: { dashArray: [3 - 2.75 * slowness, 1 + slowness] },
        // More curved when faster, so the fastest is the longest and stands out
        bend: side * (0.2 - 0.12 * slowness),
    };
};

interface RoutePathLayersProps {
    routes: Api.Route[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

const RoutePathLayers = ({
    routes,
    selectedId,
    onSelect,
}: RoutePathLayersProps) => {
    const toggle = (id: string) => {
        onSelect(selectedId === id ? null : id);
    };

    const drawnRoutes = useMemo(
        () =>
            sortRoutes(
                routes.filter(({ steps }) => steps.length > 0),
                'travelTime',
            ).map((route, rank, sortedRoutes) => ({
                route,
                styles: createRoutePathStyles(rank, sortedRoutes.length),
            })),
        [routes],
    );
    // On a phone, the selected route's steps take its label's place
    const isPhone = useIsPhone();

    // Fastest first, so its label gets the best spot. Built again only when
    // the routes or what's shown change, as labels are placed again from them.
    const labeledPaths = useMemo(
        () =>
            drawnRoutes
                // When a route is selected, the others' label is hidden
                .filter(
                    ({ route }) =>
                        (selectedId === null || selectedId === route.id) &&
                        !(isPhone && selectedId === route.id),
                )
                .map(({ route, styles }) => ({
                    id: route.id,
                    line: createRoutePathGeometry(route.steps, styles.bend),
                })),
        [drawnRoutes, selectedId, isPhone],
    );
    const { placements, registerLabel, moveLabel } =
        useLabelPlacement(labeledPaths);

    return (
        <>
            {drawnRoutes.map(({ route, styles }) => (
                <RoutePathLayer
                    key={route.id}
                    id={`route-${route.id}`}
                    steps={route.steps}
                    getStepIcon={getRouteStepIcon}
                    styles={styles}
                    emphasis={
                        selectedId === null
                            ? 'default'
                            : selectedId === route.id
                              ? 'selected'
                              : 'muted'
                    }
                    onClick={() => {
                        toggle(route.id);
                    }}
                />
            ))}
            {drawnRoutes.map(({ route }, rank) => {
                const placement = placements.get(route.id);
                if (!placement) {
                    return null;
                }
                return (
                    <RoutePathLabel
                        key={route.id}
                        id={route.id}
                        ref={registerLabel(route.id)}
                        position={placement.anchor}
                        offset={placement.offset}
                        offsetEdge={placement.edge}
                        onDrag={(movement) => {
                            moveLabel(route.id, movement);
                        }}
                        steps={route.steps}
                        badge={
                            // Only stands out when there's more than one
                            rank === 0 && drawnRoutes.length > 1 ? (
                                <BestRouteBadge order="travelTime" />
                            ) : null
                        }
                        selected={selectedId === route.id}
                        // On a phone, it's hidden once selected instead
                        expanded={selectedId === route.id && !isPhone}
                        onClick={() => {
                            toggle(route.id);
                        }}
                    />
                );
            })}
        </>
    );
};

export default RoutePathLayers;
