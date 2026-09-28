import { CarIcon } from '@phosphor-icons/react';
import RouteCard from './RouteCard';

type DrivingRouteCardProps = {
    travelTimeSeconds: number;
    distanceMeters: number;
};

const DrivingRouteCard = ({ travelTimeSeconds, distanceMeters }: DrivingRouteCardProps) => {
    return (
        <RouteCard
            icon={<CarIcon />}
            label="Auto"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

export default DrivingRouteCard;
