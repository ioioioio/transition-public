import { useMap } from '@vis.gl/react-maplibre';
import { useEffect } from 'react';

import {
    type StackingOrder,
    useStackingOrder,
} from '@/hooks/use-stacking-order';
import { isNestedIn } from '@/utils/nested-id';

/**
 * A stacking order of parent ids, empty until one is raised. The layers nested under each are kept
 * in front of other layers, in that order, each group keeping its own order.
 */
export const useLayerStack = (): StackingOrder => {
    const { current: mapRef } = useMap();
    if (!mapRef) {
        throw new Error('useLayerStack must be used within a Map');
    }
    const stack = useStackingOrder();
    useEffect(() => {
        const map = mapRef.getMap();
        for (const parentId of stack.ids) {
            const ids = map
                .getStyle()
                .layers.map((layer) => layer.id)
                .filter((id) => isNestedIn(id, parentId));
            for (const id of ids) {
                map.moveLayer(id);
            }
        }
    }, [mapRef, stack.ids]);
    return stack;
};
