import {
    ClockIcon,
    IdentificationCardIcon,
    SuitcaseRollingIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { Api } from 'common';
import { useTranslation } from 'react-i18next';

import { useTransitStepLabels } from '@/features/trip-comparison/hooks/use-transit-step-labels';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { modeIcons } from '@/utils/mode';

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
    const describeIcon = (): { icon: Icon; label: string } => {
        switch (step.activity) {
            case 'walkingToStop':
            case 'walkingToDestination':
                return { icon: modeIcons.walking, label: modeLabels.walking };
            case 'waitingAtStop':
                return {
                    icon: ClockIcon,
                    label: getWaitingAtLabel(step.boardingMode),
                };
            case 'boarding':
                return {
                    icon: IdentificationCardIcon,
                    label: t('transitStep.securityAndBoarding'),
                };
            case 'unboarding':
                return {
                    icon: SuitcaseRollingIcon,
                    label: t('transitStep.unboardingAndLuggage'),
                };
            case 'inVehicle':
                return {
                    icon: modeIcons[step.mode],
                    label: modeLabels[step.mode],
                };
            default:
                return step satisfies never;
        }
    };
    const { icon: StepIcon, label } = describeIcon();

    return (
        <StepIcon
            className={className}
            {...(decorative
                ? { 'aria-hidden': true }
                : { role: 'img', 'aria-label': label })}
        />
    );
};

export default RouteStepIcon;
