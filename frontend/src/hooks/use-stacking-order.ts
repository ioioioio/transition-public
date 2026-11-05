import { useState } from 'react';

export interface StackingOrder {
    /** The ids raised so far, from bottom to top. */
    ids: readonly string[];
    /** Brings an id to the top, keeping the others in order. */
    raise: (id: string) => void;
}

/** A stacking order of ids, empty until one is raised. */
export const useStackingOrder = (): StackingOrder => {
    const [ids, setIds] = useState<readonly string[]>([]);
    const raise = (id: string) => {
        setIds((previous) => [...previous.filter((other) => other !== id), id]);
    };
    return { ids, raise };
};
