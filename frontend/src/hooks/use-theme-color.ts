import Color from 'colorjs.io';
import { useSyncExternalStore } from 'react';

const getThemeColor = (variable: `--${string}`) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
        variable,
    );
    return new Color(value).to('srgb').toString({ format: 'rgba_number' });
};

const subscribeToThemeClass = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
    return () => observer.disconnect();
};

/**
 * Reads a theme color in a format that libraries like MapLibre understand, as they can't use CSS
 * variables nor modern colors like `oklch()`. Subscribes to theme changes.
 *
 * @param variable - CSS variable holding the color, e.g. `'--primary'`.
 */
export const useThemeColor = (variable: `--${string}`) =>
    useSyncExternalStore(subscribeToThemeClass, () => getThemeColor(variable));
