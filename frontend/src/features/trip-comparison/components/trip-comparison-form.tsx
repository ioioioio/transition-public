import { CircleIcon, MapPinIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import PlaceInput from '@/components/inputs/place-input';
import type { PlaceRef } from '@/types/place';

type TripComparisonFormProps = {
    origin: PlaceRef | null;
    destination: PlaceRef | null;
    onOriginChange: (origin: PlaceRef | null) => void;
    onDestinationChange: (destination: PlaceRef | null) => void;
};

const TripComparisonForm = ({
    origin,
    destination,
    onOriginChange,
    onDestinationChange,
}: TripComparisonFormProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-1.5">
            <PlaceInput
                icon={<CircleIcon className="size-3.5 text-muted-foreground" />}
                placeholder={t('tripComparison.origin')}
                clearLabel={t('tripComparison.clearOrigin')}
                value={origin}
                onValueChange={onOriginChange}
            />
            <PlaceInput
                icon={<MapPinIcon className="size-4 text-primary" />}
                placeholder={t('tripComparison.destination')}
                clearLabel={t('tripComparison.clearDestination')}
                value={destination}
                onValueChange={onDestinationChange}
            />
        </div>
    );
};

export default TripComparisonForm;
