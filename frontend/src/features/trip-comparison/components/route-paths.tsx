import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RoutePath } from '@/components/map/route-path';
import {
    isUnimodalRouteResultEntry,
    type RoutingMode,
} from '@/features/trip-comparison/utils/route-result';
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
    result: Api.RouteResponse['result'] | undefined;
    selectedMode: RoutingMode | null;
    onSelect: (mode: RoutingMode | null) => void;
};

const RoutePaths = ({ result, selectedMode, onSelect }: RoutePathsProps) => {
    const { i18n } = useTranslation();
    const toggle = (mode: RoutingMode) =>
        onSelect(selectedMode === mode ? null : mode);

    const paths = Object.entries(result ?? {})
        .filter(isUnimodalRouteResultEntry)
        .flatMap(([mode, modeResult]) => {
            const path = modeResult.paths[0];
            return path ? [{ mode, path }] : [];
        })
        .sort((a, b) => a.path.travelTimeSeconds - b.path.travelTimeSeconds);

    return paths.map(({ mode, path }, rank) => (
        <RoutePath
            key={mode}
            id={`route-${mode}`}
            steps={[{ geometry: path.geometry, mode }]}
            styles={createRoutePathStyles(rank, paths.length)}
            label={formatDuration(path.travelTimeSeconds, i18n.language)}
            selected={selectedMode === mode}
            onLabelClick={() => toggle(mode)}
        />
    ));
};

export default RoutePaths;
