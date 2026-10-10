import { ClockIcon, type Icon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import { useModeLabels } from '@/hooks/use-mode-labels';
import type { RouteStepData } from '@/types/route-step';
import { modeIcons } from '@/utils/mode';

type RouteStepIconProps = {
    step: RouteStepData;
    // Hidden from screen readers, when the text next to it already says it
    decorative?: boolean;
    className?: string;
};

const RouteStepIcon = ({
    step,
    decorative = false,
    className,
}: RouteStepIconProps) => {
    const { t } = useTranslation();
    const modeLabels = useModeLabels();
    const describeIcon = (): { icon: Icon; label: string } => {
        switch (step.activity) {
            case 'walkingToStop':
            case 'walkingToDestination':
                return { icon: modeIcons.walking, label: modeLabels.walking };
            case 'waitingAtStop':
                return {
                    icon: ClockIcon,
                    label: t('transitStep.waitingAtStop'),
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
