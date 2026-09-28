import RouteLines from './RouteLines';
import RouteResults from './RouteResults';
import MapView from '../../../components/map/MapView';
import PlaceMarker from '../../../components/map/PlaceMarker';
import TripComparisonForm from './TripComparisonForm';
import useTripPlaces from '../hooks/useTripPlaces';
import SidePanel from '../../../components/layouts/SidePanel';

function TripComparison() {
    const { origin, destination, setOrigin, setDestination, placeAt } = useTripPlaces();

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <SidePanel>
                <TripComparisonForm
                    origin={origin}
                    destination={destination}
                    onOriginClear={() => setOrigin(null)}
                    onDestinationClear={() => setDestination(null)}
                />
                <RouteResults origin={origin} destination={destination} />
            </SidePanel>
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView onMapClick={placeAt}>
                    <RouteLines origin={origin} destination={destination} />
                    {origin && <PlaceMarker label="A" position={origin} onMove={setOrigin} />}
                    {destination && <PlaceMarker label="B" position={destination} onMove={setDestination} />}
                </MapView>
            </div>
        </div>
    );
}

export default TripComparison;
