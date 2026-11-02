import type { Api } from 'common';
import type { Position } from 'geojson';
import { useTranslation } from 'react-i18next';

import { LineLabel } from '@/components/map/labeled-line-layer';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface RoutePathLabelProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    steps: Api.RouteStep[];
    selected: boolean;
    onClick: () => void;
}

// Sums up a route on the map
const RoutePathLabel = ({
    position,
    steps,
    selected,
    onClick,
}: RoutePathLabelProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';
    const MainModeIcon = modeIcons[mainMode];

    return (
        <LineLabel position={position} selected={selected} onClick={onClick}>
            <MainModeIcon role="img" aria-label={modeLabels[mainMode]} />
            {formatDuration(travelTimeSeconds, i18n.language)}
        </LineLabel>
    );
};

export default RoutePathLabel;
