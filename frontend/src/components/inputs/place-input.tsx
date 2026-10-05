import { MapPinIcon, XIcon } from '@phosphor-icons/react';
import type { Api } from 'common';
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

type PlaceInputProps = {
    icon: ReactNode;
    placeholder: string;
    clearLabel: string;
    value: string;
    onClear: () => void;
};

const PlaceInput = ({
    icon,
    placeholder,
    clearLabel,
    value,
    onClear,
}: PlaceInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const anchorRef = useComboboxAnchor();
    const [open, setOpen] = useState(false);

    // `value` is the label of the place currently set: its name when chosen
    // from the search, or its coordinates when picked on the map.
    // `text` is what the field shows: the same as `value`, except while the
    // user is typing a new search
    const [text, setText] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    if (value !== previousValue) {
        setPreviousValue(value);
        setText(value);
    }

    const isTyping = text !== value;
    const { data: places = [] } = usePlaceSearchQuery(isTyping ? text : '');

    const clear = () => {
        setText('');
        onClear();
        inputRef.current?.focus();
    };

    return (
        <Combobox
            items={places}
            // The place search already filters the results
            filter={null}
            itemToStringLabel={(place: Api.Place) => place.label}
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
