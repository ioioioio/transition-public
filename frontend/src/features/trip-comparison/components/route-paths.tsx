import type { Api, Utils } from 'common';

import { useRouteQuery } from '@/api/route';
import {
    DrivingRoutePath,
    WalkingRoutePath,
} from '@/components/map/route-path';
import type { RouteMode } from '@/features/trip-comparison/types';

type RoutePathsProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    time: Api.TripTime;
    selectedMode: RouteMode | null;
    onSelect: (mode: RouteMode | null) => void;
};

const RoutePaths = ({
    origin,
    destination,
    time,
    selectedMode,
    onSelect,
}: RoutePathsProps) => {
    const routeQuery = useRouteQuery(origin, destination, time);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];
    const toggle = (mode: RouteMode) =>
        onSelect(selectedMode === mode ? null : mode);

    return (
        <>
            {drivingPath && (
                <DrivingRoutePath
                    geometry={drivingPath.geometry}
                    selected={selectedMode === 'driving'}
                    onLabelClick={() => toggle('driving')}
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                />
            )}
            {walkingPath && (
                <WalkingRoutePath
                    geometry={walkingPath.geometry}
                    selected={selectedMode === 'walking'}
                    onLabelClick={() => toggle('walking')}
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                />
            )}
        </>
    );
};

export default RoutePaths;
