import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatDistance, formatDuration } from '../../../utils/format';

type RouteCardProps = {
    icon: ReactNode;
    label: string;
    travelTimeSeconds: number;
    distanceMeters: number;
};

const RouteCard = ({ icon, label, travelTimeSeconds, distanceMeters }: RouteCardProps) => {
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

export default RouteCard;
