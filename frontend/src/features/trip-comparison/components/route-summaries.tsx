import { RulerIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type {
    RouteAlternative,
    RouteAlternativeOrder,
    RouteSummary,
} from '@/features/trip-comparison/types/route-alternative';
import { useModeLabels } from '@/hooks/use-mode-labels';
import { formatDistance, formatDuration } from '@/utils/format';
import { modeIcons } from '@/utils/mode';

type BestRouteBadgeProps = {
    order: RouteAlternativeOrder;
};

const BestRouteBadge = ({ order }: BestRouteBadgeProps) => {
    const { t } = useTranslation();
    const labels: Record<RouteAlternativeOrder, string> = {
        travelTime: t('bestRoute.travelTime'),
    };
    return (
        <Badge className="h-auto rounded-sm bg-highlight font-normal px-2.5 py-0.75 text-[11px] tracking-[0.02em] text-highlight-foreground">
            {labels[order]}
        </Badge>
    );
};

type RouteSummaryItemProps = {
    id: string;
    summary: RouteSummary;
    badge?: ReactNode;
};

const RouteSummaryItem = ({ id, summary, badge }: RouteSummaryItemProps) => {
    const { rankedModes, travelTimeSeconds, distanceMeters } = summary;
    const { t, i18n } = useTranslation();
    const modeLabels = useModeLabels();
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
                <span className="flex flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between gap-2">
                        {modeLabels[mode]}
                        {badge}
                    </span>
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
    order: RouteAlternativeOrder;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
};

const RouteSummaries = ({
    routes,
    order,
    selectedId,
    onSelect,
}: RouteSummariesProps) => {
    return (
        <Accordion
            className="gap-2"
            value={selectedId ? [selectedId] : []}
            onValueChange={(value: string[]) => onSelect(value.at(0) ?? null)}
        >
            {routes.map(({ id, summary }, index) => (
                <RouteSummaryItem
                    key={id}
                    id={id}
                    summary={summary}
                    badge={
                        index === 0 &&
                        routes.length > 1 && <BestRouteBadge order={order} />
                    }
                />
            ))}
        </Accordion>
    );
};

export default RouteSummaries;
