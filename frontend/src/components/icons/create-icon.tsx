import { IconBase, type Icon, type IconWeight } from '@phosphor-icons/react';
import { forwardRef, type ReactElement } from 'react';

// Phosphor's
const gridSize = 256;

/**
 * An icon used like Phosphor's, filled whatever its weight.
 *
 * @param svg - An SVG file's text, with filled paths.
 */
export const createIcon = (svg: string): Icon => {
    // "x y width height"
    const [, , width] =
        /viewBox="([^"]+)"/
            .exec(svg)?.[1]
            ?.split(/[\s,]+/)
            .map(Number) ?? [];
    if (!width) {
        throw new Error('The SVG has no viewBox');
    }
    const path = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)]
        .map(([, data = '']) => data)
        .join(' ');
    // Scaled to Phosphor's grid
    const shape = (
        <g transform={`scale(${String(gridSize / width)})`}>
            <path d={path} />
        </g>
    );
    const weights = new Map<IconWeight, ReactElement>(
        (['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const).map(
            (weight) => [weight, shape],
        ),
    );
    return forwardRef((props, ref) => (
        <IconBase ref={ref} {...props} weights={weights} />
    ));
};
