import { z } from 'zod';

import * as Utils from './utils';

const MapConfigSchema = z.object({
    defaultCamera: z.object({
        lng: Utils.LongitudeSchema,
        lat: Utils.LatitudeSchema,
        zoom: z.number().min(0).max(24),
    }),
    styles: z.object({
        light: z.url(),
        dark: z.url(),
    }),
});

export type MapConfig = z.infer<typeof MapConfigSchema>;

// Everything in it must be safe to expose to the browser, even by accident
export const PublicConfigSchema = z.object({
    map: MapConfigSchema,
});

export type PublicConfig = z.infer<typeof PublicConfigSchema>;
