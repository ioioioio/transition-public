import type { LineString } from 'geojson';
import RouteLine from './RouteLine';

type WalkingRouteLineProps = {
    geometry: LineString;
};

const WalkingRouteLine = ({ geometry }: WalkingRouteLineProps) => {
    return <RouteLine id="route-walking" geometry={geometry} bend={-0.1} dashArray={[1.5, 1.5]} />;
};

export default WalkingRouteLine;
