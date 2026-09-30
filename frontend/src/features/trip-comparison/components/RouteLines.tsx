import type { Utils } from 'common';

import { useRouteQuery } from '@/api/route';
import { DrivingRouteLine, WalkingRouteLine } from '@/components/map/RouteLine';
import type { RouteMode } from '@/features/trip-comparison/types';

type RouteLinesProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    selectedMode: RouteMode | null;
    onSelect: (mode: RouteMode | null) => void;
};

const RouteLines = ({
    origin,
    destination,
    selectedMode,
    onSelect,
}: RouteLinesProps) => {
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];
    const toggle = (mode: RouteMode) =>
        onSelect(selectedMode === mode ? null : mode);

    return (
        <>
            {drivingPath && (
                <DrivingRouteLine
                    geometry={drivingPath.geometry}
                    selected={selectedMode === 'driving'}
                    onLabelClick={() => toggle('driving')}
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                />
            )}
            {walkingPath && (
                <WalkingRouteLine
                    geometry={walkingPath.geometry}
                    selected={selectedMode === 'walking'}
                    onLabelClick={() => toggle('walking')}
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                />
            )}
        </>
    );
};

export default RouteLines;
