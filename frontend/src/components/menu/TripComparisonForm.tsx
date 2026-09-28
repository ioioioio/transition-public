import { CircleIcon, MapPinIcon } from '@phosphor-icons/react';
import type { LngLat } from 'maplibre-gl';

import PlaceInput from '../inputs/PlaceInput';

// Five decimals is about one meter of precision.
const formatPosition = (position: LngLat | null) =>
    position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : '';

type PlacesFormProps = {
    origin: LngLat | null;
    destination: LngLat | null;
    onOriginClear: () => void;
    onDestinationClear: () => void;
};

const PlacesForm = ({ origin, destination, onOriginClear, onDestinationClear }: PlacesFormProps) => {
    return (
        <div className="flex flex-col gap-1.5">
            <PlaceInput
                icon={<CircleIcon className="size-3.5 text-muted-foreground" />}
                placeholder="Origine"
                clearLabel="Effacer l’origine"
                value={formatPosition(origin)}
                onClear={onOriginClear}
            />
            <PlaceInput
                icon={<MapPinIcon className="size-4 text-primary" />}
                placeholder="Destination"
                clearLabel="Effacer la destination"
                value={formatPosition(destination)}
                onClear={onDestinationClear}
            />
        </div>
    );
};

export default PlacesForm;
