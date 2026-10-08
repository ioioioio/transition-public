import { RulerIcon } from '@phosphor-icons/react';
import type { Api, Utils } from 'common';
import { useTranslation } from 'react-i18next';

import { useRouteQuery } from '@/api/route';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    isUnimodalRouteResultEntry,
    type UnimodalRouteResult,
} from '@/features/trip-comparison/utils/route-result';
import { formatDistance, formatDuration } from '@/utils/format';
import { modeIcons, type Mode } from '@/utils/mode';

type RouteResultItemProps = {
    value: Mode;
    result: UnimodalRouteResult;
};

const RouteResultItem = ({ value, result }: RouteResultItemProps) => {
    const { t, i18n } = useTranslation();
    const modeLabels: Record<Mode, string> = {
        driving: t('routeMode.driving'),
        walking: t('routeMode.walking'),
        bus: t('routeMode.bus'),
        other: t('routeMode.other'),
    };
    const path = result.paths[0];
    if (!path) {
        return null;
    }
    const { travelTimeSeconds, distanceMeters } = path;
    const ModeIcon = modeIcons[value];

    return (
        <AccordionItem
            value={value}
            className="rounded-lg ring-1 ring-foreground/10 ring-inset not-last:border-b-0 hover:bg-card data-open:bg-card data-open:ring-primary/50"
        >
            <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
                <span className="text-lg text-muted-foreground group-aria-expanded/accordion-trigger:text-primary">
                    <ModeIcon />
                </span>
                <span className="flex flex-col gap-1">
                    <span>{modeLabels[value]}</span>
                    <span className="text-[17px] tracking-tight tabular-nums">
                        {formatDuration(travelTimeSeconds, i18n.language)}
                    </span>
                </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
                <div className="flex items-center gap-1.5 border-t border-border pt-2 text-xs">
                    <RulerIcon className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                        {t('tripComparison.distance')}
                    </span>
                    <span className="font-medium tabular-nums">
                        {formatDistance(distanceMeters, i18n.language)}
                    </span>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

type RouteResultsProps = {
    origin: Utils.LngLat | null;
    destination: Utils.LngLat | null;
    time: Api.TripTime;
    selectedMode: Mode | null;
    onSelect: (mode: Mode | null) => void;
};

const RouteResults = ({
    origin,
    destination,
    time,
    selectedMode,
    onSelect,
}: RouteResultsProps) => {
    const routeQuery = useRouteQuery(origin, destination, time);

    return (
        <Accordion
            className="gap-2"
            value={selectedMode ? [selectedMode] : []}
            onValueChange={(value: Mode[]) => onSelect(value.at(0) ?? null)}
        >
            {Object.entries(routeQuery.data?.result ?? {})
                .filter(isUnimodalRouteResultEntry)
                .map(([mode, result]) => (
                    <RouteResultItem key={mode} value={mode} result={result} />
                ))}
        </Accordion>
    );
};

export default RouteResults;
