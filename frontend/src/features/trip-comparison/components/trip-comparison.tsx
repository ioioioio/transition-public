import type { Api, Utils } from 'common';

import { useRouteQueries } from '@/api/route';
import SidePanel from '@/components/layouts/side-panel';
import MapView from '@/components/map/map-view';
import PlaceMarker from '@/components/map/place-marker';
import RoutePathCards from '@/features/trip-comparison/components/route-path-cards';
import RoutePathLayers from '@/features/trip-comparison/components/route-path-layers';
import TripComparisonForm from '@/features/trip-comparison/components/trip-comparison-form';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import type { TripPlaces } from '@/features/trip-comparison/types/trip-places';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import type { PlaceRef } from '@/types/place';

interface TripComparisonProps {
    places: TripPlaces;
    onPlacesChange: (places: TripPlaces) => void;
    time: Api.TripTime;
    onTimeChange: (time: Api.TripTime) => void;
    mapCamera: Utils.MapCamera;
    onMapCameraChange?: (camera: Utils.MapCamera) => void;
    selectedRouteId: string | null;
    onSelectedRouteIdChange: (id: string | null) => void;
}

function TripComparison({
    places,
    onPlacesChange,
    time,
    onTimeChange,
    mapCamera,
    onMapCameraChange,
    selectedRouteId,
    onSelectedRouteIdChange,
}: TripComparisonProps) {
    const { origin, destination } = places;
    const setOrigin = (place: PlaceRef | null) => {
        onPlacesChange({ origin: place, destination });
    };
    const setDestination = (place: PlaceRef | null) => {
        onPlacesChange({ origin, destination: place });
    };
    const swapPlaces = () => {
        onPlacesChange({ origin: destination, destination: origin });
    };

    const setOriginOrDestination = (position: Utils.LngLat) => {
        if (origin === null) {
            setOrigin({ position });
        } else {
            setDestination({ position });
        }
    };

    const originPosition = origin?.position ?? null;
    const destinationPosition = destination?.position ?? null;
    const routeQueries = useRouteQueries(
        originPosition,
        destinationPosition,
        time,
    );
    const order: RouteOrder = 'travelTime'; // Not configurable yet
    const routes = sortRoutes(routeQueries.routes, order);
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
                    onPlacesSwap={swapPlaces}
                    time={time}
                    onTimeChange={onTimeChange}
                    searchFocus={mapCamera.center}
                />
                <RoutePathCards
                    routes={routes}
                    isLoading={routeQueries.isFetching}
                    order={order}
                    selectedId={selectedRoute?.id ?? null}
                    onSelect={onSelectedRouteIdChange}
                />
            </SidePanel>
            <div className="order-first h-[60svh] md:order-0 md:h-auto md:flex-1">
                <MapView
                    camera={mapCamera}
                    onCameraChange={onMapCameraChange}
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
                            onMove={(position) => {
                                setOrigin({ position });
                            }}
                        />
                    )}
                    {destinationPosition && (
                        <PlaceMarker
                            label="B"
                            position={destinationPosition}
                            onMove={(position) => {
                                setDestination({ position });
                            }}
                        />
                    )}
                </MapView>
            </div>
        </div>
    );
}

export default TripComparison;
