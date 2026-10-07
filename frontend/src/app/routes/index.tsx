import { createFileRoute } from '@tanstack/react-router';
import { Api, Utils } from 'common';
import { z } from 'zod';

import type { MapViewState } from '@/components/map/map-view';
import { mapDefaultView } from '@/config/env';
import TripComparison from '@/features/trip-comparison/components/trip-comparison';
import { defaultTripTime } from '@/features/trip-comparison/trip-time';
import type { TripPlaces } from '@/features/trip-comparison/types';

const PlaceSearchSchema = z
    .object({
        id: z.string().optional(),
        position: Utils.LngLatSchema,
    })
    .optional()
    // Drop an invalid place rather than failing the page.
    .catch(undefined);

const MapSearchSchema = Utils.LngLatSchema.extend({
    zoom: z.number().min(0).max(24),
})
    .optional()
    .catch(undefined);

const TimeSearchSchema = Api.TripTimeSchema.optional().catch(undefined);

const TripSearchSchema = z.object({
    origin: PlaceSearchSchema,
    destination: PlaceSearchSchema,
    time: TimeSearchSchema,
    map: MapSearchSchema,
});

export const Route = createFileRoute('/')({
    validateSearch: TripSearchSchema,
    component: TripPage,
});

function TripPage() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    const setPlaces = ({ origin, destination }: TripPlaces) => {
        void navigate({
            search: (previous) => ({
                ...previous,
                origin: origin ?? undefined,
                destination: destination ?? undefined,
            }),
        });
    };

    const setTime = (time: Api.TripTime) => {
        void navigate({
            search: (previous) => ({ ...previous, time }),
        });
    };

    const setMapView = (map: MapViewState) => {
        void navigate({
            search: (previous) => ({ ...previous, map }),
            // Panning isn't worth a history entry.
            replace: true,
        });
    };

    return (
        <TripComparison
            origin={search.origin ?? null}
            destination={search.destination ?? null}
            onPlacesChange={setPlaces}
            time={search.time ?? defaultTripTime}
            onTimeChange={setTime}
            mapView={search.map ?? mapDefaultView}
            onMapViewChange={setMapView}
        />
    );
}
