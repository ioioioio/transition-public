import { createFileRoute } from '@tanstack/react-router';
import TripComparison from '../../features/trip-comparison/components/TripComparison';

export const Route = createFileRoute('/')({
    component: TripComparison,
});
