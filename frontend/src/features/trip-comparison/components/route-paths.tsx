import type { Api, Utils } from 'common';
import { useTranslation } from 'react-i18next';

import { useRouteQuery } from '@/api/route';
import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RoutePath } from '@/components/map/route-path';
import { isUnimodalRouteResultEntry } from '@/features/trip-comparison/utils/route-result';
import { formatDuration } from '@/utils/format';
import type { Mode } from '@/utils/mode';

const routePathStyles: Record<Mode, LabeledCurveStyles> = {
    driving: { bend: 0.15, dashArray: [0.25, 2], labelPosition: 0.36 },
    walking: { bend: -0.1, dashArray: [1.5, 1.5], labelPosition: 0.64 },
};

type RoutePathsProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    time: Api.TripTime;
    selectedMode: Mode | null;
    onSelect: (mode: Mode | null) => void;
};

const RoutePaths = ({
    origin,
    destination,
    time,
    selectedMode,
    onSelect,
}: RoutePathsProps) => {
    const { i18n } = useTranslation();
    const routeQuery = useRouteQuery(origin, destination, time);
    const toggle = (mode: Mode) =>
        onSelect(selectedMode === mode ? null : mode);

    return Object.entries(routeQuery.data?.result ?? {})
        .filter(isUnimodalRouteResultEntry)
        .map(([mode, result]) => {
            const path = result.paths[0];
            if (!path) {
                return null;
            }
            return (
                <RoutePath
                    key={mode}
                    id={`route-${mode}`}
                    steps={[{ geometry: path.geometry, mode }]}
                    styles={routePathStyles[mode]}
                    label={formatDuration(
                        path.travelTimeSeconds,
                        i18n.language,
                    )}
                    selected={selectedMode === mode}
                    onLabelClick={() => toggle(mode)}
                />
            );
        });
};

export default RoutePaths;
