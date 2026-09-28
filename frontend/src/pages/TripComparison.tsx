import { useRouteQuery } from '../api/route';
import MapView from '../components/map/MapView';
import Menu from '../components/menu/Menu';
import useTripPlaces from '../hooks/useTripPlaces';
import React from 'react';

function TripComparison() {
    const { origin, destination, setOrigin, setDestination, placeAt } = useTripPlaces();
    const routeQuery = useRouteQuery(origin, destination);

    React.useEffect(() => {
        if (routeQuery.isLoading) {
            console.log("route loading")
        }
        if (routeQuery.data) {
            console.log("route data", routeQuery.data)
        }
    }, [routeQuery])

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <Menu
                origin={origin}
                destination={destination}
                onOriginClear={() => setOrigin(null)}
                onDestinationClear={() => setDestination(null)}
            />
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView
                    origin={origin}
                    destination={destination}
                    onMapClick={placeAt}
                    onOriginMove={setOrigin}
                    onDestinationMove={setDestination}
                />
            </div>
        </div>
    );
}

export default TripComparison;
