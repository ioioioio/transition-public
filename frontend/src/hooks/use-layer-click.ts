import { createContext, useContext, useEffect } from 'react';

export interface LayerPointerHandlers {
    onClick?: () => void;
    onPress?: () => void;
}

export type LayerClickHandlers = Map<string, LayerPointerHandlers>;

export const createLayerClickHandlers = (): LayerClickHandlers => new Map();

export const LayerClickHandlersContext =
    createContext<LayerClickHandlers | null>(null);

// Clicks on the layer call `onClick` instead of the map's own click
export const useLayerClick = (
    layerId: string,
    onClick?: () => void,
    onPress?: () => void,
) => {
    const handlers = useContext(LayerClickHandlersContext);
    if (!handlers) {
        throw new Error('useLayerClick must be used within a MapView');
    }
    useEffect(() => {
        if (!onClick && !onPress) {
            return;
        }
        handlers.set(layerId, { onClick, onPress });
        return () => {
            handlers.delete(layerId);
        };
    }, [handlers, layerId, onClick, onPress]);
};
