import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

import { useTransitStepLabels } from '@/features/trip-comparison/hooks/use-transit-step-labels';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { getRouteStepIcon } from '@/utils/route-step';

interface RouteStepIconProps {
    step: Api.RouteStep;
    // Hidden from screen readers, when the text next to it already says it
    decorative?: boolean;
    className?: string;
}

const RouteStepIcon = ({
    step,
    decorative = false,
    className,
}: RouteStepIconProps) => {
    const { t } = useTranslation();
    const modeLabels = useModeLabels();
    const { getWaitingAtLabel } = useTransitStepLabels();
    const describeIcon = (): string => {
        switch (step.activity) {
            case 'walkingToStop':
            case 'walkingToDestination':
                return modeLabels.walking;
            case 'waitingAtStop':
                return getWaitingAtLabel(step.boardingMode);
            case 'boarding':
                return t('transitStep.securityAndBoarding');
            case 'unboarding':
                return t('transitStep.unboardingAndLuggage');
            case 'inVehicle':
                return modeLabels[step.mode];
            default:
                return step satisfies never;
        }
    };
    const StepIcon = getRouteStepIcon(step);

    return (
        // eslint-disable-next-line react-hooks/static-components -- returns a module-level component
        <StepIcon
            className={className}
            {...(decorative
                ? { 'aria-hidden': true }
                : { role: 'img', 'aria-label': describeIcon() })}
        />
    );
};

export default RouteStepIcon;
