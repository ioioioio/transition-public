import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

import { RoutePathLayer } from '@/components/map/route-path-layer';
import type { RouteStepLayerStyles } from '@/components/map/route-step-layer';
import RouteStepIcon from '@/features/trip-comparison/components/route-step-icon';
import { sortRoutes } from '@/features/trip-comparison/utils/route';
import { formatDuration } from '@/utils/format';

/**
 * Styles a path by its rank, from the fastest (`0`) to the slowest
 */
const createRoutePathStyles = (
    rank: number,
    count: number,
): RouteStepLayerStyles => {
    // From 0 for the fastest to 1 for the slowest
    const slowness = count > 1 ? rank / (count - 1) : 0;
    const side = rank % 2 === 0 ? 1 : -1;
    return {
        line: { dashArray: [3 - 2.75 * slowness, 1 + slowness] },
        // More curved when faster, so the fastest is the longest and stands out
        bend: side * (0.2 - 0.12 * slowness),
    };
};

type RouteStepLabelProps = {
    step: Api.RouteStep;
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

type RoutePathLayersProps = {
    routes: Api.Route[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
};

const RoutePathLayers = ({
    routes,
    selectedId,
    onSelect,
}: RoutePathLayersProps) => {
    const toggle = (id: string) => onSelect(selectedId === id ? null : id);

    const drawnRoutes = sortRoutes(
        routes.filter(({ steps }) => steps.length > 0),
        'travelTime',
    );

    return drawnRoutes.map(({ id, steps }, rank) => (
        <RoutePathLayer
            key={id}
            id={`route-${id}`}
            steps={steps}
            // When a route is selected, the others' labels are hidden
            renderStepLabel={
                selectedId === null || selectedId === id
                    ? (step) => <RouteStepLabel step={step} />
                    : undefined
            }
            styles={createRoutePathStyles(rank, drawnRoutes.length)}
            selected={selectedId === id}
            onClick={() => toggle(id)}
        />
    ));
};

export default RoutePathLayers;
