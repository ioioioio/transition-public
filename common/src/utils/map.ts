import { z } from 'zod';

import { LngLatSchema } from './geo';

// What a map shows
export const MapCameraSchema = z.object({
    center: LngLatSchema,
    zoom: z.number().min(0).max(24),
});

export type MapCamera = z.infer<typeof MapCameraSchema>;
