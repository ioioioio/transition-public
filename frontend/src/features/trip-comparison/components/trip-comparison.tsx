import type { Utils } from 'common';
import { useState } from 'react';

import SidePanel from '@/components/layouts/side-panel';
import MapView, { type MapViewState } from '@/components/map/map-view';
import PlaceMarker from '@/components/map/place-marker';
import RouteLines from '@/features/trip-comparison/components/route-lines';
import RouteResults from '@/features/trip-comparison/components/route-results';
import TripComparisonForm from '@/features/trip-comparison/components/trip-comparison-form';
import type { RouteMode, TripPlaces } from '@/features/trip-comparison/types';

type TripComparisonProps = TripPlaces & {
    onPlacesChange: (places: TripPlaces) => void;
    initialMapView?: MapViewState;
    onMapViewChange?: (view: MapViewState) => void;
};

function TripComparison({
    origin,
    destination,
    onPlacesChange,
    initialMapView,
    onMapViewChange,
}: TripComparisonProps) {
    const setOrigin = (position: Utils.LngLat | null) =>
        onPlacesChange({ origin: position, destination });
    const setDestination = (position: Utils.LngLat | null) =>
        onPlacesChange({ origin, destination: position });

    const setOriginOrDestination = (position: Utils.LngLat) => {
        if (origin === null) {
            setOrigin(position);
        } else {
            setDestination(position);
        }
    };

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
                <MapView
                    initialView={initialMapView}
                    onViewChange={onMapViewChange}
                    onMapClick={setOriginOrDestination}
                >
                    <RouteLines
                        origin={origin}
                        destination={destination}
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
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
