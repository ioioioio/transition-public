import type { LineString, Point } from 'geojson';
import { z } from 'zod';

export const LngLatSchema = z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
});

export type LngLat = z.infer<typeof LngLatSchema>;

// As `[longitude, latitude]`
export const PositionSchema = z.array(z.number()).min(2);

export type Position = z.infer<typeof PositionSchema>;

export const PointSchema = z.object({
    type: z.literal('Point'),
    coordinates: PositionSchema,
}) satisfies z.ZodType<Point>;

export const LineStringSchema = z.object({
    type: z.literal('LineString'),
    coordinates: z.array(PositionSchema).min(2),
}) satisfies z.ZodType<LineString>;
