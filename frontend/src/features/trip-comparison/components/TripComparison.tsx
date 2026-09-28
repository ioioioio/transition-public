import { useState } from 'react';
import RouteLines from './RouteLines';
import type { RouteMode } from '../types';
import RouteResults from './RouteResults';
import MapView from '../../../components/map/MapView';
import PlaceMarker from '../../../components/map/PlaceMarker';
import TripComparisonForm from './TripComparisonForm';
import useTripPlaces from '../hooks/useTripPlaces';
import SidePanel from '../../../components/layouts/SidePanel';

function TripComparison() {
    const { origin, destination, setOrigin, setDestination, placeAt } =
        useTripPlaces();
    const [selectedMode, setSelectedMode] = useState<RouteMode | null>(null);

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <SidePanel>
                <TripComparisonForm
                    origin={origin}
                    destination={destination}
                    onOriginClear={() => setOrigin(null)}
                    onDestinationClear={() => setDestination(null)}
                />
                <RouteResults
                    origin={origin}
                    destination={destination}
                    selectedMode={selectedMode}
                    onSelect={setSelectedMode}
                />
            </SidePanel>
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView onMapClick={placeAt}>
                    <RouteLines
                        origin={origin}
                        destination={destination}
                        selectedMode={selectedMode}
                    />
                    {origin && (
                        <PlaceMarker
                            label="A"
                            position={origin}
                            onMove={setOrigin}
                        />
                    )}
                    {destination && (
                        <PlaceMarker
                            label="B"
                            position={destination}
                            onMove={setDestination}
                        />
                    )}
                </MapView>
            </div>
        </div>
    );
}

export default TripComparison;
