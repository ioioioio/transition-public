import { z } from 'zod';
import {
    GeoJSONFeatureGenericSchema,
    GeoJSONPointSchema,
    GeoJSONPositionSchema,
    GeoJSONPropertiesSchema,
} from 'zod-geojson';

const TransitionRoutingModeSchema = z.enum(['driving', 'cycling', 'walking']);

export type TransitionRoutingMode = z.infer<typeof TransitionRoutingModeSchema>;

const PointFeatureSchema = GeoJSONFeatureGenericSchema(
    GeoJSONPositionSchema,
    GeoJSONPropertiesSchema.nullable(),
    GeoJSONPointSchema,
);

// Body of Transition's POST /api/v1/route
export const TransitionRouteRequestSchema = z.object({
    routingModes: z.array(TransitionRoutingModeSchema),
    originGeojson: PointFeatureSchema,
    destinationGeojson: PointFeatureSchema,
});

export type TransitionRouteRequest = z.infer<typeof TransitionRouteRequestSchema>;
