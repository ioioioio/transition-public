import { useSyncExternalStore } from 'react';

/**
 * Whether a media query matches, e.g. `'(pointer: coarse)'`. Subscribes to changes.
 */
export const useMediaQuery = (query: string): boolean =>
    useSyncExternalStore(
        (onChange) => {
            const list = window.matchMedia(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        () => window.matchMedia(query).matches,
    );
