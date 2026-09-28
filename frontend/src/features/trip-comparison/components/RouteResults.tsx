import type { Utils } from 'common';
import { useRouteQuery } from '../../../api/route';
import DrivingRouteCard from './DrivingRouteCard';
import WalkingRouteCard from './WalkingRouteCard';

type RouteResultsProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
};

const RouteResults = ({ origin, destination }: RouteResultsProps) => {
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];

    return (
        <div className="flex flex-col gap-2">
            {drivingPath && (
                <DrivingRouteCard
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                    distanceMeters={drivingPath.distanceMeters}
                />
            )}
            {walkingPath && (
                <WalkingRouteCard
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                    distanceMeters={walkingPath.distanceMeters}
                />
            )}
        </div>
    );
};

export default RouteResults;
