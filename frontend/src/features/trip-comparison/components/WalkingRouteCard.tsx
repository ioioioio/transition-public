import { PersonSimpleWalkIcon } from '@phosphor-icons/react';
import RouteCard from './RouteCard';

type WalkingRouteCardProps = {
    travelTimeSeconds: number;
    distanceMeters: number;
};

const WalkingRouteCard = ({ travelTimeSeconds, distanceMeters }: WalkingRouteCardProps) => {
    return (
        <RouteCard
            icon={<PersonSimpleWalkIcon />}
            label="Marche"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

export default WalkingRouteCard;
