import type { Utils } from 'common';
import { useRouteQuery } from '../../../api/route';
import DrivingRouteLine from '../../../components/map/DrivingRouteLine';
import WalkingRouteLine from '../../../components/map/WalkingRouteLine';

type RouteLinesProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
};

const RouteLines = ({ origin, destination }: RouteLinesProps) => {
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];
    const walkingPath = routeQuery.data?.result.walking?.paths[0];

    return (
        <>
            {drivingPath && <DrivingRouteLine geometry={drivingPath.geometry} />}
            {walkingPath && <WalkingRouteLine geometry={walkingPath.geometry} />}
        </>
    );
};

export default RouteLines;
