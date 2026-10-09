import { useTranslation } from 'react-i18next';

import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RoutePath } from '@/components/map/route-path';
import type { RouteAlternative } from '@/features/trip-comparison/types/route-alternative';
import type { RoutingMode } from '@/features/trip-comparison/utils/route-result';
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

type RoutePathsProps = {
    routes: RouteAlternative[];
    selectedMode: RoutingMode | null;
    onSelect: (mode: RoutingMode | null) => void;
};

const RoutePaths = ({ routes, selectedMode, onSelect }: RoutePathsProps) => {
    const { i18n } = useTranslation();
    const toggle = (mode: RoutingMode) =>
        onSelect(selectedMode === mode ? null : mode);

    const drawnRoutes = routes
        .filter(({ steps }) => steps.length > 0)
        .sort(
            (a, b) => a.summary.travelTimeSeconds - b.summary.travelTimeSeconds,
        );

    return drawnRoutes.map(({ id, summary, steps }, rank) => (
        <RoutePath
            key={id}
            id={`route-${id}`}
            steps={steps}
            styles={createRoutePathStyles(rank, drawnRoutes.length)}
            label={formatDuration(summary.travelTimeSeconds, i18n.language)}
            selected={selectedMode === id}
            onLabelClick={() => toggle(id)}
        />
    ));
};

export default RoutePaths;
