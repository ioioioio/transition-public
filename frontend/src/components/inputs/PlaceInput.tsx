import { XIcon } from '@phosphor-icons/react';
import { useRef, type ReactNode } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

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

    const clear = () => {
        onClear();
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-s-3.5 top-1/2 flex -translate-y-1/2">
                {icon}
            </span>
            <Input
                ref={inputRef}
                value={value}
                placeholder={placeholder}
                className="h-10.5 rounded-md bg-card ps-9.5 pe-11 dark:bg-card"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label={clearLabel}
                    onClick={clear}
                    className="absolute inset-y-0 inset-e-1 my-auto text-muted-foreground"
                >
                    <XIcon />
                </Button>
            )}
        </div>
    );
};

export default PlaceInput;
