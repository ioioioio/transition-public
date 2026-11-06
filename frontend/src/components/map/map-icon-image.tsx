import type { Icon } from '@phosphor-icons/react';
import type { StyleImageMetadata } from 'maplibre-gl';
import { createElement, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { useMapImageCreators } from '@/hooks/map/use-map-image-creators';

export interface MapImageData {
    data: ImageData;
    options: Partial<StyleImageMetadata>;
}

// At least 2, so icons stay sharp once MapLibre scales them down to their CSS
// size
const getPixelRatio = () => Math.max(2, Math.ceil(window.devicePixelRatio));

const drawImage = (
    width: number,
    height: number,
    draw: (context: CanvasRenderingContext2D) => void,
) => {
    const pixelRatio = getPixelRatio();
    const canvas = document.createElement('canvas');
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas 2D is not supported');
    }
    context.scale(pixelRatio, pixelRatio);
    draw(context);
    return {
        data: context.getImageData(0, 0, canvas.width, canvas.height),
        pixelRatio,
    };
};

// Phosphor icons are a single path on a 256 by 256 grid
const iconGridSize = 256;
const iconPaths = new Map<Icon, string>();

const getIconPath = (icon: Icon) => {
    const cachedPath = iconPaths.get(icon);
    if (cachedPath !== undefined) {
        return cachedPath;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    flushSync(() => {
        root.render(createElement(icon));
    });
    const path = container.querySelector('path')?.getAttribute('d') ?? '';
    root.unmount();
    iconPaths.set(icon, path);
    return path;
};

// In CSS pixels
const iconHaloWidth = 2;

interface MapIconImageProps {
    /** How layers refer to the image. Changing how it looks needs a new id. */
    id: string;
    /** The Phosphor icon to draw. */
    icon: Icon;
    /** Any CSS color. */
    color: string;
    /** Around the icon, so it stands out from what's under it. Any CSS color. */
    haloColor: string;
    /** Width and height of the icon, in CSS pixels. The image is wider by its halo. */
    size: number;
}

const drawIconImage = (props: MapIconImageProps): MapImageData => {
    const { icon, color, haloColor, size } = props;
    const path = new Path2D(getIconPath(icon));
    const imageSize = size + iconHaloWidth * 2;
    const { data, pixelRatio } = drawImage(imageSize, imageSize, (context) => {
        context.translate(iconHaloWidth, iconHaloWidth);
        const scale = size / iconGridSize;
        context.scale(scale, scale);
        // Centred on the outline, so twice as wide as the halo
        context.lineWidth = (iconHaloWidth * 2) / scale;
        context.lineJoin = 'round';
        context.strokeStyle = haloColor;
        context.stroke(path);
        context.fillStyle = color;
        context.fill(path);
    });
    return { data, options: { pixelRatio } };
};

/**
 * Makes an icon available to the map's layers, under its id.
 * Doesn't show anything by itself: a layer has to use it.
 */
export const MapIconImage = (props: MapIconImageProps) => {
    const { id, icon, color, haloColor, size } = props;
    const creators = useMapImageCreators();
    useEffect(() => {
        creators.set(id, () =>
            drawIconImage({ id, icon, color, haloColor, size }),
        );
        return () => {
            creators.delete(id);
        };
    }, [creators, id, icon, color, haloColor, size]);
    return null;
};
