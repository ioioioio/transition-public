import type { Api, Utils } from 'common';
import { useState } from 'react';

import { useRouteQuery } from '@/api/route';
import SidePanel from '@/components/layouts/side-panel';
import MapView, { type MapViewState } from '@/components/map/map-view';
import PlaceMarker from '@/components/map/place-marker';
import RoutePaths from '@/features/trip-comparison/components/route-paths';
import RouteSummaries from '@/features/trip-comparison/components/route-summaries';
import TripComparisonForm from '@/features/trip-comparison/components/trip-comparison-form';
import type { RouteAlternativeOrder } from '@/features/trip-comparison/types/route-alternative';
import type { TripPlaces } from '@/features/trip-comparison/types/trip-places';
import { createSortedRouteAlternatives } from '@/features/trip-comparison/utils/route-alternative';
import type { PlaceRef } from '@/types/place';

type TripComparisonProps = TripPlaces & {
    onPlacesChange: (places: TripPlaces) => void;
    time: Api.TripTime;
    onTimeChange: (time: Api.TripTime) => void;
    mapView: MapViewState;
    onMapViewChange?: (view: MapViewState) => void;
};

function TripComparison({
    origin,
    destination,
    onPlacesChange,
    time,
    onTimeChange,
    mapView,
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
    const routeQuery = useRouteQuery(originPosition, destinationPosition, time);
    const order: RouteAlternativeOrder = 'travelTime'; // Not configurable yet
    const routes = routeQuery.data
        ? createSortedRouteAlternatives(routeQuery.data, order)
        : [];

    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <SidePanel>
                <TripComparisonForm
                    origin={origin}
                    destination={destination}
                    onOriginChange={setOrigin}
                    onDestinationChange={setDestination}
                    time={time}
                    onTimeChange={onTimeChange}
                    searchFocus={mapView}
                />
                <RouteSummaries
                    routes={routes}
                    order={order}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </SidePanel>
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView
                    mapView={mapView}
                    onViewChange={onMapViewChange}
                    onMapClick={setOriginOrDestination}
                >
                    <RoutePaths
                        routes={routes}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
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
