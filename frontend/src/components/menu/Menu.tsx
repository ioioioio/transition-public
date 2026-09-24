import { CircleIcon, MapPinIcon } from '@phosphor-icons/react';

import PlaceInput from './PlaceInput';

const Menu = () => {
    return (
        <aside className="flex-1 border-border p-4 md:w-110 md:flex-none md:overflow-y-auto md:border-r-2 md:p-6">
            <div className="flex flex-col gap-1.5">
                <PlaceInput
                    icon={<CircleIcon className="size-3.5 text-muted-foreground" />}
                    placeholder="Origine"
                    clearLabel="Effacer l’origine"
                />
                <PlaceInput
                    icon={<MapPinIcon className="size-4 text-primary" />}
                    placeholder="Destination"
                    clearLabel="Effacer la destination"
                />
            </div>
        </aside>
    );
};

export default Menu;
