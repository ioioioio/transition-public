import { RulerIcon } from '@phosphor-icons/react';
import type { Api } from 'common';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import RouteStepIcon from '@/features/trip-comparison/components/route-step-icon';
import { useTransitStepLabels } from '@/features/trip-comparison/hooks/use-transit-step-labels';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDistance, formatDuration } from '@/utils/format';

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

interface RoutePathDetailsProps {
    steps: Api.RouteStep[];
}

export const RoutePathDetails = ({ steps }: RoutePathDetailsProps) => {
    const { t, i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { getWalkingToLabel, getWaitingAtLabel } = useTransitStepLabels();
    const { distanceMeters } = createRouteSummary(steps);
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

    return (
        <div className="flex flex-col gap-2 border-t border-border pt-2 text-xs">
            {/* A single step would only repeat the travel time */}
            {steps.length > 1 && (
                <ul className="flex flex-col gap-0.75">
                    {steps.map((step, index) => (
                        <TimeRow
                            key={index}
                            {...describeStep(step)}
                            seconds={step.durationSeconds}
                        />
                    ))}
                </ul>
            )}
            <div className="flex items-center gap-1.5">
                <RulerIcon aria-hidden className="text-muted-foreground" />
                <span className="text-muted-foreground">
                    {t('tripComparison.distance')}
                </span>
                <span className="font-medium tabular-nums">
                    {formatDistance(distanceMeters, i18n.language)}
                </span>
            </div>
        </div>
    );
};
