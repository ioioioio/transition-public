import { MapPinIcon, XIcon } from '@phosphor-icons/react';
import type { Api, Utils } from 'common';
import { useRef, useState, type ReactNode } from 'react';

import { usePlaceSearchQuery } from '@/api/place';
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import { InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import type { PlaceRef } from '@/types/place';

const formatPosition = (position: Utils.LngLat) =>
    `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;

// Only the place chosen here has a known name, so any other place, like one
// from a shared URL, shows its coordinates until places can be fetched by id
const createPlaceLabel = (
    value: PlaceRef | null,
    chosenPlace: Api.Place | null,
) => {
    if (!value) {
        return '';
    }
    if (
        chosenPlace &&
        value.id === chosenPlace.id &&
        value.position.lng === chosenPlace.position.lng &&
        value.position.lat === chosenPlace.position.lat
    ) {
        return chosenPlace.label;
    }
    return formatPosition(value.position);
};

type PlaceInputProps = {
    icon: ReactNode;
    placeholder: string;
    clearLabel: string;
    value: PlaceRef | null;
    onValueChange: (value: PlaceRef | null) => void;
};

const PlaceInput = ({
    icon,
    placeholder,
    clearLabel,
    value,
    onValueChange,
}: PlaceInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const anchorRef = useComboboxAnchor();
    const [open, setOpen] = useState(false);
    const [chosenPlace, setChosenPlace] = useState<Api.Place | null>(null);

    // `label` is the text of the place currently set, which can also change
    // from outside, like a map click. `text` is what the field shows: the
    // same as `label`, except while the user is typing a new search
    const label = createPlaceLabel(value, chosenPlace);
    const [text, setText] = useState(label);
    const [previousLabel, setPreviousLabel] = useState(label);
    if (label !== previousLabel) {
        setPreviousLabel(label);
        setText(label);
    }

    const isTyping = text !== label;
    const { data: places = [] } = usePlaceSearchQuery(isTyping ? text : '');

    const select = (place: Api.Place | null) => {
        setChosenPlace(place);
        onValueChange(place);
    };

    const clear = () => {
        setText('');
        onValueChange(null);
        inputRef.current?.focus();
    };

    return (
        <Combobox
            items={places}
            // The place search already filters the results
            filter={null}
            itemToStringLabel={(place: Api.Place) => place.label}
            value={null}
            onValueChange={select}
            inputValue={text}
            onInputValueChange={(nextText, { reason }) => {
                // Keep the typed text when closing without a selection
                if (reason !== 'input-clear') {
                    setText(nextText);
                }
            }}
            open={open && isTyping && places.length > 0}
            onOpenChange={setOpen}
        >
            <div ref={anchorRef}>
                <ComboboxInput
                    ref={inputRef}
                    placeholder={placeholder}
                    showTrigger={false}
                    className="h-10.5 rounded-md bg-card dark:bg-card"
                >
                    <InputGroupAddon align="inline-start" className="ps-3.5">
                        {icon}
                    </InputGroupAddon>
                    {text && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-sm"
                                aria-label={clearLabel}
                                onClick={clear}
                            >
                                <XIcon />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </ComboboxInput>
            </div>
            <ComboboxContent
                anchor={anchorRef}
                className="ring-popover-border dark:shadow-[0_6px_18px_rgb(0_0_0/0.55)]"
            >
                <ComboboxList>
                    {(place: Api.Place) => (
                        <ComboboxItem
                            key={place.id}
                            value={place}
                            className="min-h-11 cursor-pointer gap-1.5 rounded-sm py-0 ps-2.75 pe-3"
                        >
                            <MapPinIcon className="text-muted-foreground" />
                            {place.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};

export default PlaceInput;
