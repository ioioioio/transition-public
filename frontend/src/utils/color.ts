import Color from 'colorjs.io';

/**
 * Reads a theme color in a format that libraries like MapLibre understand, as they can't use CSS
 * variables nor modern colors like `oklch()`.
 *
 * @param variable - CSS variable holding the color, e.g. `'--primary'`.
 */
export const getThemeColor = (variable: `--${string}`) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
        variable,
    );
    return new Color(value).to('srgb').toString({ format: 'rgba_number' });
};
