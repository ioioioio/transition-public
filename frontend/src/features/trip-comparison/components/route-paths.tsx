import { useTranslation } from 'react-i18next';

import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RoutePath } from '@/components/map/route-path';
import RouteStepIcon from '@/features/trip-comparison/components/route-step-icon';
import type { RouteAlternative } from '@/features/trip-comparison/types/route-alternative';
import type { RouteStepData } from '@/types/route-step';
import { formatDuration } from '@/utils/format';

/**
 * Styles a path by its rank, from the fastest (`0`) to the slowest
 */
const createRoutePathStyles = (
    rank: number,
    count: number,
): LabeledCurveStyles => {
    // From 0 for the fastest to 1 for the slowest
    const slowness = count > 1 ? rank / (count - 1) : 0;
    const side = rank % 2 === 0 ? 1 : -1;
    return {
        // More curved when faster, so the fastest is the longest and stands out
        bend: side * (0.2 - 0.12 * slowness),
        dashArray: [3 - 2.75 * slowness, 1 + slowness],
    };
};

type RouteStepLabelProps = {
    step: RouteStepData;
};

const RouteStepLabel = ({ step }: RouteStepLabelProps) => {
    const { i18n } = useTranslation();
    return (
        <>
            <RouteStepIcon step={step} />
            {formatDuration(step.durationSeconds, i18n.language)}
        </>
    );
};

type RoutePathsProps = {
    routes: RouteAlternative[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
};

const RoutePaths = ({ routes, selectedId, onSelect }: RoutePathsProps) => {
    const toggle = (id: string) => onSelect(selectedId === id ? null : id);

    const drawnRoutes = routes
        .filter(({ steps }) => steps.length > 0)
        .sort(
            (a, b) => a.summary.travelTimeSeconds - b.summary.travelTimeSeconds,
        );

    return drawnRoutes.map(({ id, steps }, rank) => (
        <RoutePath
            key={id}
            id={`route-${id}`}
            steps={steps}
            renderStepLabel={(step) => <RouteStepLabel step={step} />}
            styles={createRoutePathStyles(rank, drawnRoutes.length)}
            selected={selectedId === id}
            onClick={() => toggle(id)}
        />
    ));
};

export default RoutePaths;
