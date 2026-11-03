import type { Api } from 'common';
import type { Position } from 'geojson';
import type { RefCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { LineLabel } from '@/components/map/labeled-line-layer';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import type { LabelOffset } from '@/hooks/use-label-placement';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

interface RoutePathLabelProps {
    /** As `[longitude, latitude]`. */
    position: Position;
    offset: LabelOffset;
    steps: Api.RouteStep[];
    selected: boolean;
    onClick: () => void;
    onDrag: (movement: LabelOffset) => void;
    ref?: RefCallback<HTMLButtonElement>;
}

// Sums up a route on the map
const RoutePathLabel = ({
    position,
    offset,
    steps,
    selected,
    onClick,
    onDrag,
    ref,
}: RoutePathLabelProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const mainMode = rankedModes.at(0) ?? 'other';
    const MainModeIcon = modeIcons[mainMode];

    return (
        <LineLabel
            position={position}
            offset={offset}
            selected={selected}
            onClick={onClick}
            onDrag={onDrag}
            ref={ref}
        >
            <MainModeIcon role="img" aria-label={modeLabels[mainMode]} />
            {formatDuration(travelTimeSeconds, i18n.language)}
        </LineLabel>
    );
};

export default RoutePathLabel;
