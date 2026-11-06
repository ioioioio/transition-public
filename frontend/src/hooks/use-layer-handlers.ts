import { createContext, useContext, useEffect } from 'react';

export interface LayerHandlers {
    onClick?: () => void;
    onPress?: () => void;
}

export type HandlersByLayer = Map<string, LayerHandlers>;

export const createHandlersByLayer = (): HandlersByLayer => new Map();

export const HandlersByLayerContext = createContext<HandlersByLayer | null>(
    null,
);

// Clicks on the layer call `onClick` instead of the map's own click
export const useLayerHandlers = (
    layerId: string,
    onClick?: () => void,
    onPress?: () => void,
) => {
    const handlers = useContext(HandlersByLayerContext);
    if (!handlers) {
        throw new Error('useLayerHandlers must be used within a MapView');
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
