import type { Api, Utils } from 'common';

import { useRouteQuery } from '@/api/route';
import SidePanel from '@/components/layouts/side-panel';
import MapView, { type MapViewState } from '@/components/map/map-view';
import PlaceMarker from '@/components/map/place-marker';
import RoutePathCards from '@/features/trip-comparison/components/route-path-cards';
import RoutePathLayers from '@/features/trip-comparison/components/route-path-layers';
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
    selectedRouteId: string | null;
    onSelectedRouteIdChange: (id: string | null) => void;
};

function TripComparison({
    origin,
    destination,
    onPlacesChange,
    time,
    onTimeChange,
    mapView,
    onMapViewChange,
    selectedRouteId,
    onSelectedRouteIdChange,
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
    // Not found when the URL is older than the routes
    const selectedRoute = routes.find(({ id }) => id === selectedRouteId);

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
                <RoutePathCards
                    routes={routes}
                    order={order}
                    selectedId={selectedRoute?.id ?? null}
                    onSelect={onSelectedRouteIdChange}
                />
            </SidePanel>
            <div className="order-first h-[60svh] md:order-0 md:h-auto md:flex-1">
                <MapView
                    mapView={mapView}
                    onViewChange={onMapViewChange}
                    onMapClick={(position) => {
                        // Clicking off the selected route only deselects it
                        if (selectedRoute) {
                            onSelectedRouteIdChange(null);
                        } else {
                            setOriginOrDestination(position);
                        }
                    }}
                >
                    <RoutePathLayers
                        routes={routes}
                        selectedId={selectedRoute?.id ?? null}
                        onSelect={onSelectedRouteIdChange}
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
