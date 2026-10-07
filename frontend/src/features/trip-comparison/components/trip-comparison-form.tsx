import { CircleIcon, MapPinIcon } from '@phosphor-icons/react';
import type { Utils } from 'common';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PlaceInput from '@/components/inputs/place-input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PlaceRef } from '@/types/place';

const tripHours = [8, 12, 16];

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
    searchFocus: Utils.LngLat;
};

const TripComparisonForm = ({
    origin,
    destination,
    onOriginChange,
    onDestinationChange,
    searchFocus,
}: TripComparisonFormProps) => {
    const { t, i18n } = useTranslation();
    const [hour, setHour] = useState(tripHours[0]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <PlaceInput
                    icon={
                        <CircleIcon className="size-3.5 text-muted-foreground" />
                    }
                    placeholder={t('tripComparison.origin')}
                    clearLabel={t('tripComparison.clearOrigin')}
                    value={origin}
                    onValueChange={onOriginChange}
                    focus={searchFocus}
                />
                <PlaceInput
                    icon={<MapPinIcon className="size-4 text-primary" />}
                    placeholder={t('tripComparison.destination')}
                    clearLabel={t('tripComparison.clearDestination')}
                    value={destination}
                    onValueChange={onDestinationChange}
                    focus={searchFocus}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <ToggleGroup
                    aria-label={t('tripComparison.time')}
                    variant="outline"
                    spacing={1.5}
                    value={[String(hour)]}
                    onValueChange={([value]) => {
                        // Keep an hour selected when its button is pressed again
                        if (value) {
                            setHour(Number(value));
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
