import DrivingRouteCard from './DrivingRouteCard';
import DrivingRouteLine from '../../../components/map/DrivingRouteLine';
import MapView from '../../../components/map/MapView';
import PlaceMarker from '../../../components/map/PlaceMarker';
import TripComparisonForm from './TripComparisonForm';
import useTripPlaces from '../hooks/useTripPlaces';
import React from 'react';
import SidePanel from '../../../components/layouts/SidePanel';
import { useRouteQuery } from '../../../api/route';

function TripComparison() {
    const { origin, destination, setOrigin, setDestination, placeAt } = useTripPlaces();
    const routeQuery = useRouteQuery(origin, destination);
    const drivingPath = routeQuery.data?.result.driving?.paths[0];

    React.useEffect(() => {
        if (routeQuery.isLoading) {
            console.log('route loading');
        }
        if (routeQuery.data) {
            console.log('route data', routeQuery.data);
        }
    }, [routeQuery]);

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <SidePanel>
                <TripComparisonForm
                    origin={origin}
                    destination={destination}
                    onOriginClear={() => setOrigin(null)}
                    onDestinationClear={() => setDestination(null)}
                />
                {drivingPath && (
                    <DrivingRouteCard
                        travelTimeSeconds={drivingPath.travelTimeSeconds}
                        distanceMeters={drivingPath.distanceMeters}
                    />
                )}
            </SidePanel>
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView onMapClick={placeAt}>
                    {drivingPath && <DrivingRouteLine geometry={drivingPath.geometry} />}
                    {origin && <PlaceMarker label="A" position={origin} onMove={setOrigin} />}
                    {destination && <PlaceMarker label="B" position={destination} onMove={setDestination} />}
                </MapView>
            </div>
        </div>
    );
}

export default TripComparison;
