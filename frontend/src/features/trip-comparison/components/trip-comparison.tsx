import type { Utils } from 'common';
import { useState } from 'react';

import SidePanel from '@/components/layouts/side-panel';
import MapView, { type MapViewState } from '@/components/map/map-view';
import PlaceMarker from '@/components/map/place-marker';
import RouteLines from '@/features/trip-comparison/components/route-lines';
import RouteResults from '@/features/trip-comparison/components/route-results';
import TripComparisonForm from '@/features/trip-comparison/components/trip-comparison-form';
import type { RouteMode, TripPlaces } from '@/features/trip-comparison/types';
import type { PlaceRef } from '@/types/place';

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
    const setOrigin = (place: PlaceRef | null) =>
        onPlacesChange({ origin: place, destination });
    const setDestination = (place: PlaceRef | null) =>
        onPlacesChange({ origin, destination: place });

    const setOriginOrDestination = (position: Utils.LngLat) => {
        if (origin === null) {
            setOrigin({ position });
        } else {
            setDestination({ position });
        }
    };

    const originPosition = origin?.position ?? null;
    const destinationPosition = destination?.position ?? null;

    const [selectedMode, setSelectedMode] = useState<RouteMode | null>(null);

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <SidePanel>
                <TripComparisonForm
                    origin={origin}
                    destination={destination}
                    onOriginChange={setOrigin}
                    onDestinationChange={setDestination}
                />
                <RouteResults
                    origin={originPosition}
                    destination={destinationPosition}
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
                        origin={originPosition}
                        destination={destinationPosition}
                        selectedMode={selectedMode}
                        onSelect={setSelectedMode}
                    />
                    {originPosition && (
                        <PlaceMarker
                            label="A"
                            position={originPosition}
                            onMove={(position) => setOrigin({ position })}
                        />
                    )}
                    {destinationPosition && (
                        <PlaceMarker
                            label="B"
                            position={destinationPosition}
                            onMove={(position) => setDestination({ position })}
                        />
                    )}
                </MapView>
            </div>
        </div>
    );
}

export default TripComparison;
