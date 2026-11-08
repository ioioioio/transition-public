import type { Api } from 'common';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import RouteStepIcon from '@/features/trip-comparison/components/route-step-icon';
import { useTransitStepLabels } from '@/features/trip-comparison/hooks/use-transit-step-labels';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDuration } from '@/utils/format';

interface TimeRowProps {
    icon: ReactNode;
    label: string;
    seconds: number;
}

const TimeRow = ({ icon, label, seconds }: TimeRowProps) => {
    const { i18n } = useTranslation();
    return (
        <li className="flex items-center gap-2">
            <span
                className="
                    flex text-muted-foreground
                    [&>svg]:size-3.5
                "
            >
                {icon}
            </span>
            <span>{label}</span>
            <span className="ms-auto text-muted-foreground tabular-nums">
                {formatDuration(seconds, i18n.language)}
            </span>
        </li>
    );
};

interface RoutePathSummaryBodyProps {
    steps: Api.RouteStep[];
}

export const RoutePathSummaryBody = ({ steps }: RoutePathSummaryBodyProps) => {
    const { t } = useTranslation();
    const modeLabels = useModeLabels();
    const { getWalkingToLabel, getWaitingAtLabel } = useTransitStepLabels();
    const describeStep = (
        step: Api.RouteStep,
    ): { icon: ReactNode; label: string } => {
        switch (step.activity) {
            // The text doesn't say it's on foot, the icon does
            case 'walkingToStop':
                return {
                    icon: <RouteStepIcon step={step} />,
                    label: getWalkingToLabel(step.boardingMode),
                };
            case 'walkingToDestination':
                return {
                    icon: <RouteStepIcon step={step} />,
                    label: t('transitStep.walkingToDestination'),
                };
            case 'waitingAtStop':
                return {
                    icon: <RouteStepIcon step={step} decorative />,
                    label: getWaitingAtLabel(step.boardingMode),
                };
            case 'boarding':
                return {
                    icon: <RouteStepIcon step={step} decorative />,
                    label: t('transitStep.securityAndBoarding'),
                };
            case 'unboarding':
                return {
                    icon: <RouteStepIcon step={step} decorative />,
                    label: t('transitStep.unboardingAndLuggage'),
                };
            case 'inVehicle':
                return {
                    icon: <RouteStepIcon step={step} decorative />,
                    label: modeLabels[step.mode],
                };
            default:
                return step satisfies never;
        }
    };

    // A single step would only repeat the travel time
    if (steps.length <= 1) {
        return null;
    }
    return (
        <ul className="flex flex-col gap-0.75 text-xs">
            {steps.map((step, index) => (
                <TimeRow
                    key={index}
                    {...describeStep(step)}
                    seconds={step.durationSeconds}
                />
            ))}
        </ul>
    );
};
