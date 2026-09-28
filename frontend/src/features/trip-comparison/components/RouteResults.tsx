import type { Utils } from 'common';
import { useRouteQuery } from '../../../api/route';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatDistance, formatDuration } from '../../../utils/format';
import { CarIcon, PersonSimpleWalkIcon } from '@phosphor-icons/react';

type RouteResultItemProps = {
    icon: ReactNode;
    label: string;
    travelTimeSeconds: number;
    distanceMeters: number;
};

const RouteResultItem = ({ icon, label, travelTimeSeconds, distanceMeters }: RouteResultItemProps) => {
    return (
        <Card className="gap-2 rounded-lg py-3 ring-primary/50 ring-inset">
            <CardHeader className="flex items-center gap-3">
                <span className="text-lg text-primary">{icon}</span>
                <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-baseline gap-2">
                <span className="text-[17px] font-medium tracking-tight tabular-nums">
                    {formatDuration(travelTimeSeconds, 'fr-CA')}
                </span>
                <span className="text-xs text-muted-foreground">{formatDistance(distanceMeters, 'fr-CA')}</span>
            </CardContent>
        </Card>
    );
};

type ModeRouteResultItemProps = Omit<RouteResultItemProps, 'icon' | 'label'>;

const DrivingRouteResultItem = ({ travelTimeSeconds, distanceMeters }: ModeRouteResultItemProps) => {
    return (
        <RouteResultItem
            icon={<CarIcon />}
            label="Auto"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

const WalkingRouteResultItem = ({ travelTimeSeconds, distanceMeters }: ModeRouteResultItemProps) => {
    return (
        <RouteResultItem
            icon={<PersonSimpleWalkIcon />}
            label="Marche"
            travelTimeSeconds={travelTimeSeconds}
            distanceMeters={distanceMeters}
        />
    );
};

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
                <DrivingRouteResultItem
                    travelTimeSeconds={drivingPath.travelTimeSeconds}
                    distanceMeters={drivingPath.distanceMeters}
                />
            )}
            {walkingPath && (
                <WalkingRouteResultItem
                    travelTimeSeconds={walkingPath.travelTimeSeconds}
                    distanceMeters={walkingPath.distanceMeters}
                />
            )}
        </div>
    );
};

export default RouteResults;
