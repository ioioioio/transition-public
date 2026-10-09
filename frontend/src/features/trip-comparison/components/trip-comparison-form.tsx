import { CircleIcon, MapPinIcon } from '@phosphor-icons/react';
import { Api, type Utils } from 'common';
import { useTranslation } from 'react-i18next';

import PlaceInput from '@/components/inputs/place-input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { tripHours } from '@/config/env';
import {
    calculateHours,
    calculateSecondsSinceMidnight,
} from '@/features/trip-comparison/utils/trip-time';
import type { PlaceRef } from '@/types/place';

/**
 * Formats an hour of the day the way the given language writes it
 *
 * @param hour - The hour of the day, from 0 to 23
 * @param language - The BCP 47 language tag to format for, e.g. `fr-CA`
 */
const formatHour = (hour: number, language: string) =>
    new Intl.DateTimeFormat(language, { hour: 'numeric' }).format(
        // arbitrary date, only the hour is shown
        new Date(2000, 0, 1, hour),
    );

type TripComparisonFormProps = {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
    onOriginChange: (origin: PlaceRef | null) => void;
    onDestinationChange: (destination: PlaceRef | null) => void;
    time: Api.TripTime;
    onTimeChange: (time: Api.TripTime) => void;
    searchFocus: Utils.LngLat;
};

const TripComparisonForm = ({
    origin,
    destination,
    onOriginChange,
    onDestinationChange,
    time,
    onTimeChange,
    searchFocus,
}: TripComparisonFormProps) => {
    const { t, i18n } = useTranslation();
    const hour = calculateHours(time.secondsSinceMidnight);

    const timeTypeLabels: Record<Api.TripTimeType, string> = {
        departure: t('tripComparison.departAt'),
        arrival: t('tripComparison.arriveAt'),
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <PlaceInput
                    icon={
                        <CircleIcon
                            aria-hidden
                            className="size-3.5 text-muted-foreground"
                        />
                    }
                    placeholder={t('tripComparison.origin')}
                    clearLabel={t('tripComparison.clearOrigin')}
                    value={origin}
                    onValueChange={onOriginChange}
                    focus={searchFocus}
                />
                <PlaceInput
                    icon={
                        <MapPinIcon
                            aria-hidden
                            className="size-4 text-primary"
                        />
                    }
                    placeholder={t('tripComparison.destination')}
                    clearLabel={t('tripComparison.clearDestination')}
                    value={destination}
                    onValueChange={onDestinationChange}
                    focus={searchFocus}
                />
            </div>
            <div className="flex flex-wrap gap-3">
                <ToggleGroup
                    aria-label={t('tripComparison.timeType')}
                    variant="outline"
                    spacing={0}
                    value={[time.type]}
                    onValueChange={([value]) => {
                        // Keep a type selected when its button is pressed again
                        const type = Api.TripTimeTypeSchema.safeParse(value);
                        if (type.success) {
                            onTimeChange({ ...time, type: type.data });
                        }
                    }}
                >
                    {Api.TripTimeTypeSchema.options.map((type) => (
                        <ToggleGroupItem
                            key={type}
                            value={type}
                            // Buttons overlap by their border, so their shared edge is
                            // drawn by the focused one, then by the selected one
                            className="bg-card not-first:-ms-px not-first:border-s! focus-visible:z-20 aria-pressed:z-10 aria-pressed:border-primary aria-pressed:bg-card aria-pressed:text-primary aria-pressed:hover:text-primary"
                        >
                            {timeTypeLabels[type]}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                <ToggleGroup
                    aria-label={t('tripComparison.time')}
                    variant="outline"
                    spacing={1.5}
                    value={[String(hour)]}
                    onValueChange={([value]) => {
                        // Keep an hour selected when its button is pressed again
                        if (value) {
                            onTimeChange({
                                ...time,
                                secondsSinceMidnight:
                                    calculateSecondsSinceMidnight(
                                        Number(value),
                                    ),
                            });
                        }
                    }}
                >
                    {tripHours.map((tripHour) => (
                        <ToggleGroupItem
                            key={tripHour}
                            value={String(tripHour)}
                            className="bg-card aria-pressed:border-primary aria-pressed:bg-card aria-pressed:text-primary aria-pressed:hover:text-primary"
                        >
                            {formatHour(tripHour, i18n.language)}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </div>
    );
};

export default TripComparisonForm;
