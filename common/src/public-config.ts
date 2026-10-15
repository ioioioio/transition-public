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

const RoutingSetupSchema = z.object({
    scenarioId: z.uuid(),
    modes: z.array(z.string().min(1)).min(1),
});

export type RoutingSetup = z.infer<typeof RoutingSetupSchema>;

// Everything in it must be safe to expose to the browser, even by accident
export const PublicConfigSchema = z.object({
    map: MapConfigSchema,
    routingSetups: z.array(RoutingSetupSchema).min(1),
});

export type PublicConfig = z.infer<typeof PublicConfigSchema>;
