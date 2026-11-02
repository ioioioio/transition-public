import { RulerIcon } from '@phosphor-icons/react';
import type { Api } from 'common';
import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import RouteStepIcon from '@/features/trip-comparison/components/route-step-icon';
import { useTransitStepLabels } from '@/features/trip-comparison/hooks/use-transit-step-labels';
import type { RouteOrder } from '@/features/trip-comparison/types/route';
import { createRouteSummary } from '@/features/trip-comparison/utils/route';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { cn } from '@/lib/utils';
import { formatDistance, formatDuration } from '@/utils/format';
import { resizeTransition } from '@/utils/label-animation';
import { modeIcons } from '@/utils/mode';

interface BestRouteBadgeProps {
    order: RouteOrder;
}

export const BestRouteBadge = ({ order }: BestRouteBadgeProps) => {
    const { t } = useTranslation();
    const labels: Record<RouteOrder, string> = {
        travelTime: t('bestRoute.travelTime'),
    };
    return (
        <Badge className="h-auto rounded-sm bg-highlight font-normal px-2.5 py-0.75 text-[11px] tracking-[0.02em] text-highlight-foreground">
            {labels[order]}
        </Badge>
    );
};

export interface RouteSummaryLayoutIds {
    icon: string;
    travelTime: string;
}

interface RoutePathCardHeaderProps {
    steps: Api.RouteStep[];
    badge?: ReactNode;
    selected: boolean;
    // So its icon and travel time glide to and from another summary of the
    // route with the same IDs, like its label on the map
    layoutIds?: RouteSummaryLayoutIds;
}

// The modes and travel time of a route, in a row of the element it's put in
export const RoutePathCardHeader = ({
    steps,
    badge,
    selected,
    layoutIds,
}: RoutePathCardHeaderProps) => {
    const { i18n } = useTranslation();
    const modeLabels = useModeLabels();
    const { rankedModes, travelTimeSeconds } = createRouteSummary(steps);
    const MainModeIcon = modeIcons[rankedModes.at(0) ?? 'other'];
    // E.g. "Plane + Bus"
    const title = rankedModes
        .map((rankedMode) => modeLabels[rankedMode])
        .join(' + ');

    return (
        <>
            <m.span
                layoutId={layoutIds?.icon}
                // Only between its summary and card, not as the map moves
                layoutDependency={layoutIds?.icon}
                transition={{ layout: resizeTransition }}
                className={cn(
                    'text-lg',
                    selected ? 'text-primary' : 'text-muted-foreground',
                )}
            >
                <MainModeIcon aria-hidden />
            </m.span>
            <span className="flex flex-1 flex-col gap-1">
                <span className="flex items-center justify-between gap-2">
                    {title}
                    {badge}
                </span>
                <m.span
                    layoutId={layoutIds?.travelTime}
                    // Only between its summary and card, not as the map moves
                    layoutDependency={layoutIds?.travelTime}
                    transition={{ layout: resizeTransition }}
                    className="self-start text-[17px] tracking-tight tabular-nums"
                >
                    {formatDuration(travelTimeSeconds, i18n.language)}
                </m.span>
            </span>
        </>
    );
};

interface TimeRowProps {
    icon: ReactNode;
    label: string;
    seconds: number;
}

const TimeRow = ({ icon, label, seconds }: TimeRowProps) => {
    const { i18n } = useTranslation();
    return (
        <li className="flex items-center gap-2">
            <span className="flex text-muted-foreground [&>svg]:size-3.5">
                {icon}
            </span>
            <span>{label}</span>
            <span className="ms-auto text-muted-foreground tabular-nums">
                {formatDuration(seconds, i18n.language)}
            </span>
        </li>
    );
};

interface RoutePathCardDetailsProps {
    steps: Api.RouteStep[];
}

// How long each step of a route takes, and how far it goes
export const RoutePathCardDetails = ({ steps }: RoutePathCardDetailsProps) => {
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
