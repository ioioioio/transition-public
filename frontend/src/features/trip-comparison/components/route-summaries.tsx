import { RulerIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type {
    RouteAlternative,
    RouteSummary,
} from '@/features/trip-comparison/types/route-alternative';
import type { RoutingMode } from '@/features/trip-comparison/utils/route-result';
import { formatDistance, formatDuration } from '@/utils/format';
import { modeIcons, type Mode } from '@/utils/mode';

type RouteSummaryItemProps = {
    id: RoutingMode;
    summary: RouteSummary;
};

const RouteSummaryItem = ({ id, summary }: RouteSummaryItemProps) => {
    const { rankedModes, travelTimeSeconds, distanceMeters } = summary;
    const { t, i18n } = useTranslation();
    const modeLabels: Record<Mode, string> = {
        driving: t('routeMode.driving'),
        walking: t('routeMode.walking'),
        bus: t('routeMode.bus'),
        other: t('routeMode.other'),
    };
    // Shown by its main mode
    const mode = rankedModes.at(0) ?? 'other';
    const ModeIcon = modeIcons[mode];

    return (
        <AccordionItem
            value={id}
            className="rounded-lg ring-1 ring-foreground/10 ring-inset not-last:border-b-0 hover:bg-card data-open:bg-card data-open:ring-primary/50"
        >
            <AccordionTrigger className="items-center gap-3 px-4 py-3 hover:no-underline">
                <span className="text-lg text-muted-foreground group-aria-expanded/accordion-trigger:text-primary">
                    <ModeIcon />
                </span>
                <span className="flex flex-col gap-1">
                    <span>{modeLabels[mode]}</span>
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

type RouteSummariesProps = {
    routes: RouteAlternative[];
    selectedMode: RoutingMode | null;
    onSelect: (mode: RoutingMode | null) => void;
};

const RouteSummaries = ({
    routes,
    selectedMode,
    onSelect,
}: RouteSummariesProps) => {
    return (
        <Accordion
            className="gap-2"
            value={selectedMode ? [selectedMode] : []}
            onValueChange={(value: RoutingMode[]) =>
                onSelect(value.at(0) ?? null)
            }
        >
            {routes.map(({ id, summary }) => (
                <RouteSummaryItem key={id} id={id} summary={summary} />
            ))}
        </Accordion>
    );
};

export default RouteSummaries;
