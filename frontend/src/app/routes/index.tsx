import { createFileRoute } from '@tanstack/react-router';
import { Utils } from 'common';
import { z } from 'zod';
import TripComparison from '../../features/trip-comparison/components/TripComparison';
import type { TripPlaces } from '../../features/trip-comparison/types';

const PlaceSearchSchema = Utils.LngLatSchema.optional()
    // Drop an invalid place rather than failing the page.
    .catch(undefined);

const TripSearchSchema = z.object({
    origin: PlaceSearchSchema,
    destination: PlaceSearchSchema,
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

    return (
        <TripComparison
            origin={search.origin ?? null}
            destination={search.destination ?? null}
            onPlacesChange={setPlaces}
        />
    );
}
