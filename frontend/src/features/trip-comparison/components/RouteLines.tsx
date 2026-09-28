import type { Utils } from 'common';
import { useRouteQuery } from '../../../api/route';
import {
    DrivingRouteLine,
    WalkingRouteLine,
} from '../../../components/map/RouteLine';
import type { RouteMode } from '../types';

type RouteLinesProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    selectedMode: RouteMode | null;
};

const RouteLines = ({ origin, destination, selectedMode }: RouteLinesProps) => {
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];

    return (
        <>
            {drivingPath && (
                <DrivingRouteLine
                    geometry={drivingPath.geometry}
                    selected={selectedMode === 'driving'}
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                />
            )}
            {walkingPath && (
                <WalkingRouteLine
                    geometry={walkingPath.geometry}
                    selected={selectedMode === 'walking'}
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                />
            )}
        </>
    );
};

export default RouteLines;
