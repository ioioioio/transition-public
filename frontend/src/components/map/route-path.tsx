import type { LabeledCurveStyles } from '@/components/map/labeled-curve';
import { RouteStep, type RouteStepData } from '@/components/map/route-step';

export type RoutePathProps = {
    id: string;
    // Drawn in order, e.g. a single one for a path with one mode
    steps: RouteStepData[];
    // The same for all the steps of the path
    styles: LabeledCurveStyles;
    selected?: boolean;
    onLabelClick?: () => void;
};

export const RoutePath = ({
    id,
    steps,
    styles,
    selected,
    onLabelClick,
}: RoutePathProps) => {
    return steps.map((step, index) => (
        <RouteStep
            key={index}
            id={`${id}-${index}`}
            step={step}
            styles={styles}
            selected={selected}
            onLabelClick={onLabelClick}
        />
    ));
};
