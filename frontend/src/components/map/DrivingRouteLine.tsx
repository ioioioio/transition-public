import type { LineString } from 'geojson';
import RouteLine from './RouteLine';

type DrivingRouteLineProps = {
    geometry: LineString;
};

const DrivingRouteLine = ({ geometry }: DrivingRouteLineProps) => {
    return <RouteLine id="route-driving" geometry={geometry} bend={0.15} dashArray={[0.25, 2]} />;
};

export default DrivingRouteLine;
