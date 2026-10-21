import { z } from 'zod';

import * as Utils from '../utils';
import { RouteStepSchema } from './route-steps';

export const TripTimeTypeSchema = z.enum(['departure', 'arrival']);
export type TripTimeType = z.infer<typeof TripTimeTypeSchema>;

export const TripTimeSchema = z.object({
    type: TripTimeTypeSchema,
    hour: z.int().min(0).max(23),
});

export type TripTime = z.infer<typeof TripTimeSchema>;

export const RouteBodySchema = z.object({
    routingSetupId: z.string().min(1),
    origin: Utils.LngLatSchema,
    destination: Utils.LngLatSchema,
    time: TripTimeSchema,
});

export type RouteBody = z.infer<typeof RouteBodySchema>;

// A way to make the trip
export const RouteSchema = z.object({
    id: z.string(),
    steps: z.array(RouteStepSchema),
});

export type Route = z.infer<typeof RouteSchema>;

export const RouteResponseSchema = z.object({
    // Null when the routing setup has no route for the trip
    route: RouteSchema.nullable(),
});
export type RouteResponse = z.infer<typeof RouteResponseSchema>;

export const routeEndpoint = {
    method: 'post',
    path: '/api/route',
    body: RouteBodySchema,
    response: RouteResponseSchema,
} as const;
